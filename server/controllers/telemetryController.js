import Telemetry from "../models/Telemetry.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const DEFAULT_VEHICLE_ID = "EV-001";

export const getLatestTelemetry = asyncHandler(async (req, res) => {
  const vehicleId = req.query.vehicleId || DEFAULT_VEHICLE_ID;
  const latest = await Telemetry.findOne({ vehicleId }).sort({ timestamp: -1 });
  res.json({ success: true, data: latest });
});

export const getTelemetryHistory = asyncHandler(async (req, res) => {
  const vehicleId = req.query.vehicleId || DEFAULT_VEHICLE_ID;
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 1000);
  const { from, to } = req.query;

  const filter = { vehicleId };
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }

  const history = await Telemetry.find(filter).sort({ timestamp: -1 }).limit(limit);
  res.json({ success: true, data: history.reverse() }); // oldest -> newest for charts
});

/**
 * POST /api/telemetry
 *
 * This is the endpoint real ESP32/OBD-II hardware will call in the final
 * round. It expects the exact same JSON shape the simulator produces, and
 * runs through the identical AI/DB/Socket.IO pipeline
 * (SimulatorManager.processTelemetry) - so simulated and real telemetry are
 * fully interchangeable from the backend's point of view.
 */
export const postTelemetry = asyncHandler(async (req, res) => {
  const body = req.body;

  if (!body || !body.vehicleId) {
    return res.status(400).json({ success: false, message: "vehicleId is required" });
  }

  const reading = {
    vehicleId: body.vehicleId,
    timestamp: body.timestamp || new Date().toISOString(),
    soc: body.soc,
    soh: body.soh,
    voltage: body.voltage,
    current: body.current,
    batteryTemperature: body.batteryTemperature,
    motorTemperature: body.motorTemperature,
    speed: body.speed,
    chargingStatus: !!body.chargingStatus,
    power: body.power,
    estimatedRange: body.estimatedRange,
    chargingPower: body.chargingPower,
    batteryCycleCount: body.batteryCycleCount,
    acceleration: body.acceleration,
    latitude: body.latitude,
    longitude: body.longitude,
    mode: body.mode || "REAL",
  };

  const manager = req.app.get("simulatorManager");
  const analysis = await manager.processTelemetry(reading, { persist: true });

  res.status(201).json({ success: true, data: { reading, analysis } });
});
