import Alert from "../models/Alert.js";
import { THRESHOLDS } from "./aiAnalysisService.js";

// Maps an anomaly "type" to the telemetry field + threshold it relates to,
// so alerts can show a concrete current value vs. threshold.
const ANOMALY_FIELD_MAP = {
  "Battery Overheating": {
    parameter: "batteryTemperature",
    threshold: THRESHOLDS.batteryTemperature.warn,
    title: "Battery Temperature Rising",
    recommendation: "Allow the battery to cool and avoid high loads.",
  },
  "Rapid Thermal Increase": {
    parameter: "batteryTemperature",
    threshold: THRESHOLDS.tempRateOfChange.warnPerMin,
    title: "Rapid Battery Temperature Increase",
    recommendation: "Monitor battery temperature closely; reduce load if it continues rising.",
  },
  "Voltage Instability": {
    parameter: "voltage",
    threshold: THRESHOLDS.voltage.nominal,
    title: "Voltage Instability Detected",
    recommendation: "Have the electrical system and battery management system inspected.",
  },
  "Excessive Current": {
    parameter: "current",
    threshold: THRESHOLDS.current.warn,
    title: "Excessive Current Draw",
    recommendation: "Avoid rapid acceleration to reduce current draw.",
  },
  "Motor Overheating": {
    parameter: "motorTemperature",
    threshold: THRESHOLDS.motorTemperature.warn,
    title: "Motor Temperature High",
    recommendation: "Reduce speed to lower motor load and allow cooling.",
  },
  "Battery Health Degradation": {
    parameter: "soh",
    threshold: THRESHOLDS.soh.warn,
    title: "Battery Health Degradation",
    recommendation: "Schedule a full battery health diagnostic.",
  },
  "Abnormal Charging Behaviour": {
    parameter: "current",
    threshold: THRESHOLDS.current.warn,
    title: "Abnormal Charging Behaviour",
    recommendation: "Stop charging and inspect the charging system.",
  },
  "Multiple System Anomalies": {
    parameter: "safetyScore",
    threshold: 60,
    title: "Critical Battery Thermal Risk",
    recommendation: "Stop the vehicle safely and schedule an immediate inspection.",
  },
};

/**
 * Persists an Alert document for each anomaly and returns the created docs
 * so the caller can emit them over Socket.IO.
 */
export async function createAlertsFromAnomalies(vehicleId, telemetry, anomalies) {
  if (!anomalies || anomalies.length === 0) return [];

  const docs = anomalies.map((anomaly) => {
    const meta = ANOMALY_FIELD_MAP[anomaly.type] || {
      parameter: "safetyScore",
      threshold: 60,
      title: anomaly.type,
      recommendation: "Inspect the vehicle.",
    };

    return {
      vehicleId,
      title: meta.title,
      severity: anomaly.severity,
      parameter: meta.parameter,
      currentValue: telemetry[meta.parameter] ?? null,
      threshold: meta.threshold,
      recommendation: meta.recommendation,
    };
  });

  return Alert.insertMany(docs);
}
