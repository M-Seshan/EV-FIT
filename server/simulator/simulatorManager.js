import { TelemetrySimulator, MODES } from "./telemetrySimulator.js";
import Telemetry from "../models/Telemetry.js";
import Analysis from "../models/Analysis.js";
import Maintenance from "../models/Maintenance.js";
import { runAnalysis } from "../services/aiAnalysisService.js";
import { createAlertsFromAnomalies } from "../services/alertService.js";

const DEFAULT_VEHICLE_ID = "EV-001";
const HISTORY_WINDOW = 20; // how many recent readings we feed into trend analysis

/**
 * Owns the single running simulator instance and everything downstream of a
 * tick: persisting telemetry, running AI analysis, persisting alerts /
 * maintenance predictions, and broadcasting over Socket.IO.
 *
 * This is intentionally the ONLY place that knows about the simulator. The
 * REST API for real hardware (POST /api/telemetry) reuses the same
 * `processTelemetry` pipeline below, so simulated and real data are handled
 * identically end to end.
 */
export class SimulatorManager {
  constructor(io) {
    this.io = io;
    this.vehicleId = DEFAULT_VEHICLE_ID;
    this.recentHistory = []; // in-memory rolling window, oldest -> newest
    this.simulator = new TelemetrySimulator({
      vehicleId: this.vehicleId,
      intervalMs: 2000,
      onTick: (reading) => this.processTelemetry(reading, { persist: true }),
    });
  }

  start() {
    this.simulator.start();
  }

  stop() {
    this.simulator.stop();
  }

  reset() {
    this.simulator.reset();
    this.recentHistory = [];
  }

  setMode(mode) {
    this.simulator.setMode(mode);
  }

  setSpeed(multiplier) {
    this.simulator.setSpeedMultiplier(multiplier);
  }

  setManualOverride(field, value) {
    this.simulator.setManualOverride(field, value);
  }

  clearManualOverrides() {
    this.simulator.clearManualOverrides();
  }

  isRunning() {
    return this.simulator.running;
  }

  getStatus() {
    return {
      running: this.simulator.running,
      mode: this.simulator.mode,
      speedMultiplier: this.simulator.speedMultiplier,
      vehicleId: this.vehicleId,
      availableModes: Object.values(MODES),
    };
  }

  /**
   * Shared pipeline for BOTH simulated ticks and real hardware POSTs
   * (see controllers/telemetryController.js -> POST /api/telemetry).
   */
  async processTelemetry(reading, { persist = true } = {}) {
    try {
      // 1. Run AI analysis against recent history
      const analysisResult = runAnalysis(reading, this.recentHistory);

      // 2. Update rolling in-memory history window
      this.recentHistory.push(reading);
      if (this.recentHistory.length > HISTORY_WINDOW) {
        this.recentHistory.shift();
      }

      // 3. Persist telemetry
      if (persist) {
        await Telemetry.create(reading);
      }

      // 4. Broadcast telemetry immediately (don't block UI on DB writes below)
      this.io.emit("telemetry:update", { ...reading, safetyScore: analysisResult.safetyScore });

      // 5. Persist + broadcast analysis
      if (persist) {
        await Analysis.create({
          vehicleId: reading.vehicleId,
          riskLevel: analysisResult.riskLevel,
          safetyScore: analysisResult.safetyScore,
          anomalies: analysisResult.anomalies.map((a) => ({
            type: a.type,
            severity: a.severity,
            risk: a.risk,
            message: a.message,
          })),
          predictions: analysisResult.predictions,
          recommendations: analysisResult.recommendations,
        });
      }
      this.io.emit("analysis:update", analysisResult);

      // 6. Persist + broadcast alerts (only when anomalies exist)
      if (analysisResult.anomalies.length > 0) {
        if (persist) {
          const alerts = await createAlertsFromAnomalies(reading.vehicleId, reading, analysisResult.anomalies);
          alerts.forEach((alert) => this.io.emit("alert:new", alert));
        } else {
          analysisResult.anomalies.forEach((a) => this.io.emit("alert:new", a));
        }
      }

      // 7. Persist maintenance predictions (dedupe naively by issue+priority per tick is fine for a prototype)
      if (persist && analysisResult.maintenanceItems.length > 0) {
        const docs = analysisResult.maintenanceItems.map((m) => ({
          vehicleId: reading.vehicleId,
          ...m,
        }));
        const created = await Maintenance.insertMany(docs);
        created.forEach((m) => this.io.emit("maintenance:new", m));
      }

      return analysisResult;
    } catch (err) {
      console.error("[simulatorManager] Error processing telemetry:", err.message);
      throw err;
    }
  }
}
