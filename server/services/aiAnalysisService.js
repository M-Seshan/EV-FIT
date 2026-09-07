/**
 * aiAnalysisService.js
 *
 * The "intelligence layer" of EV-FIT.
 *
 * This is a deliberately explainable, rule-based analysis engine (thresholds +
 * trend analysis on recent history), NOT a black-box ML model. That is a
 * conscious choice for a hackathon prototype: every number it produces can be
 * traced back to a concrete condition, which is important when you have to
 * explain your scoring logic to judges.
 *
 * Responsibilities:
 *  1. Calculate a 0-100 EV Safety Score from the current telemetry reading.
 *  2. Detect anomalies (single-reading threshold violations + rate-of-change
 *     trends across recent history).
 *  3. Turn detected trends into predictive-maintenance recommendations.
 *
 * NOTE: This prototype's outputs are for demonstration purposes only and are
 * NOT certified for real-world automotive safety decisions.
 */

// ---------------------------------------------------------------------------
// Thresholds (single source of truth - used by scoring, anomaly detection,
// and alerts so the whole system stays consistent).
// ---------------------------------------------------------------------------
export const THRESHOLDS = {
  batteryTemperature: { warn: 40, critical: 50 }, // °C
  motorTemperature: { warn: 65, critical: 80 }, // °C
  voltage: { nominal: 390, warn: 25, critical: 45 }, // V, deviation from nominal
  current: { warn: 80, critical: 120 }, // A
  soc: { low: 15, critical: 5 }, // %
  soh: { warn: 80, critical: 65 }, // %
  tempRateOfChange: { warnPerMin: 3, criticalPerMin: 6 }, // °C per minute
};

// ---------------------------------------------------------------------------
// Safety Score
// ---------------------------------------------------------------------------
/**
 * Calculates a 0-100 safety score starting from a baseline of 100 and
 * deducting points for each abnormal condition. Returns the score plus a
 * breakdown of every deduction so the UI/judges can see exactly why the
 * score is what it is.
 */
export function calculateSafetyScore(telemetry) {
  let score = 100;
  const deductions = [];

  const deduct = (points, reason) => {
    score -= points;
    deductions.push({ points, reason });
  };

  const {
    batteryTemperature = 0,
    motorTemperature = 0,
    voltage = THRESHOLDS.voltage.nominal,
    current = 0,
    soc = 100,
    soh = 100,
    chargingStatus = false,
  } = telemetry;

  // Battery temperature
  if (batteryTemperature >= THRESHOLDS.batteryTemperature.critical) {
    deduct(35, "Critical battery temperature");
  } else if (batteryTemperature >= THRESHOLDS.batteryTemperature.warn) {
    const severity =
      (batteryTemperature - THRESHOLDS.batteryTemperature.warn) /
      (THRESHOLDS.batteryTemperature.critical - THRESHOLDS.batteryTemperature.warn);
    deduct(Math.round(10 + severity * 15), "Elevated battery temperature");
  }

  // Motor temperature
  if (motorTemperature >= THRESHOLDS.motorTemperature.critical) {
    deduct(25, "Critical motor temperature");
  } else if (motorTemperature >= THRESHOLDS.motorTemperature.warn) {
    const severity =
      (motorTemperature - THRESHOLDS.motorTemperature.warn) /
      (THRESHOLDS.motorTemperature.critical - THRESHOLDS.motorTemperature.warn);
    deduct(Math.round(8 + severity * 12), "Elevated motor temperature");
  }

  // Voltage stability (deviation from nominal)
  const voltageDeviation = Math.abs(voltage - THRESHOLDS.voltage.nominal);
  if (voltageDeviation >= THRESHOLDS.voltage.critical) {
    deduct(20, "Critical voltage instability");
  } else if (voltageDeviation >= THRESHOLDS.voltage.warn) {
    deduct(10, "Voltage fluctuation outside normal range");
  }

  // Current behaviour
  if (Math.abs(current) >= THRESHOLDS.current.critical) {
    deduct(15, "Critical current draw");
  } else if (Math.abs(current) >= THRESHOLDS.current.warn) {
    deduct(7, "Higher than normal current draw");
  }

  // SOC
  if (soc <= THRESHOLDS.soc.critical) {
    deduct(10, "Critically low state of charge");
  } else if (soc <= THRESHOLDS.soc.low) {
    deduct(5, "Low state of charge");
  }

  // SOH
  if (soh <= THRESHOLDS.soh.critical) {
    deduct(15, "Critical battery health degradation");
  } else if (soh <= THRESHOLDS.soh.warn) {
    deduct(7, "Battery health below optimal range");
  }

  // Abnormal charging behaviour: charging while current is unusually high
  if (chargingStatus && Math.abs(current) >= THRESHOLDS.current.warn) {
    deduct(5, "Abnormal charging current");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, deductions };
}

export function scoreToStatus(score) {
  if (score >= 90) return "EXCELLENT";
  if (score >= 80) return "GOOD";
  if (score >= 60) return "WARNING";
  if (score >= 40) return "HIGH_RISK";
  return "CRITICAL";
}

export function scoreToRiskLevel(score) {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  if (score >= 40) return "HIGH";
  return "CRITICAL";
}

// ---------------------------------------------------------------------------
// Trend helpers
// ---------------------------------------------------------------------------
/**
 * Rate of change per minute between the oldest and newest reading of a field
 * across a history array (assumed sorted oldest -> newest).
 */
function rateOfChangePerMinute(history, field) {
  if (!history || history.length < 2) return 0;
  const first = history[0];
  const last = history[history.length - 1];
  const v1 = first[field];
  const v2 = last[field];
  if (typeof v1 !== "number" || typeof v2 !== "number") return 0;

  const t1 = new Date(first.timestamp).getTime();
  const t2 = new Date(last.timestamp).getTime();
  const minutes = (t2 - t1) / 60000;
  if (minutes <= 0) return 0;

  return (v2 - v1) / minutes;
}

function average(history, field) {
  const values = history.map((h) => h[field]).filter((v) => typeof v === "number");
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(history, field) {
  const values = history.map((h) => h[field]).filter((v) => typeof v === "number");
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// ---------------------------------------------------------------------------
// Anomaly detection
// ---------------------------------------------------------------------------
/**
 * @param {Object} current - latest telemetry reading
 * @param {Array} history - recent telemetry readings (oldest -> newest), NOT including `current`
 */
export function detectAnomalies(current, history = []) {
  const anomalies = [];

  const {
    batteryTemperature = 0,
    motorTemperature = 0,
    voltage = THRESHOLDS.voltage.nominal,
    current: currentAmps = 0,
    soh = 100,
    chargingStatus = false,
  } = current;

  // 1. Battery overheating (threshold)
  if (batteryTemperature >= THRESHOLDS.batteryTemperature.critical) {
    anomalies.push({
      type: "Battery Overheating",
      severity: "CRITICAL",
      risk: 90,
      message: "Battery temperature has reached a critical level.",
    });
  } else if (batteryTemperature >= THRESHOLDS.batteryTemperature.warn) {
    anomalies.push({
      type: "Battery Overheating",
      severity: "HIGH",
      risk: 65,
      message: "Battery temperature anomaly detected.",
    });
  }

  // 2. Rapid temperature increase (trend)
  const combinedTempHistory = [...history, current];
  const battTempRate = rateOfChangePerMinute(combinedTempHistory, "batteryTemperature");
  if (battTempRate >= THRESHOLDS.tempRateOfChange.criticalPerMin) {
    anomalies.push({
      type: "Rapid Thermal Increase",
      severity: "CRITICAL",
      risk: 85,
      message: "Rapid thermal increase detected in battery temperature.",
    });
  } else if (battTempRate >= THRESHOLDS.tempRateOfChange.warnPerMin) {
    anomalies.push({
      type: "Rapid Thermal Increase",
      severity: "MEDIUM",
      risk: 50,
      message: "Battery temperature is rising faster than expected.",
    });
  }

  // 3. Voltage instability (deviation + volatility across history)
  const voltageDeviation = Math.abs(voltage - THRESHOLDS.voltage.nominal);
  const voltageStdDev = stdDev(combinedTempHistory, "voltage");
  if (voltageDeviation >= THRESHOLDS.voltage.critical || voltageStdDev >= 15) {
    anomalies.push({
      type: "Voltage Instability",
      severity: "HIGH",
      risk: 70,
      message: "Voltage fluctuates beyond the acceptable range.",
    });
  } else if (voltageDeviation >= THRESHOLDS.voltage.warn || voltageStdDev >= 8) {
    anomalies.push({
      type: "Voltage Instability",
      severity: "MEDIUM",
      risk: 45,
      message: "Voltage instability detected.",
    });
  }

  // 4. Excessive current
  if (Math.abs(currentAmps) >= THRESHOLDS.current.critical) {
    anomalies.push({
      type: "Excessive Current",
      severity: "CRITICAL",
      risk: 80,
      message: "Current draw has reached a critical level.",
    });
  } else if (Math.abs(currentAmps) >= THRESHOLDS.current.warn) {
    anomalies.push({
      type: "Excessive Current",
      severity: "MEDIUM",
      risk: 50,
      message: "Current draw is higher than normal.",
    });
  }

  // 5. Motor overheating
  if (motorTemperature >= THRESHOLDS.motorTemperature.critical) {
    anomalies.push({
      type: "Motor Overheating",
      severity: "CRITICAL",
      risk: 85,
      message: "Motor temperature has reached a critical level.",
    });
  } else if (motorTemperature >= THRESHOLDS.motorTemperature.warn) {
    anomalies.push({
      type: "Motor Overheating",
      severity: "HIGH",
      risk: 60,
      message: "Motor temperature anomaly detected.",
    });
  }

  // 6. Low battery health
  if (soh <= THRESHOLDS.soh.critical) {
    anomalies.push({
      type: "Battery Health Degradation",
      severity: "HIGH",
      risk: 65,
      message: "Battery state of health is critically low.",
    });
  } else if (soh <= THRESHOLDS.soh.warn) {
    anomalies.push({
      type: "Battery Health Degradation",
      severity: "MEDIUM",
      risk: 40,
      message: "Battery state of health is below the optimal range.",
    });
  }

  // 7. Abnormal charging behaviour
  if (chargingStatus && Math.abs(currentAmps) >= THRESHOLDS.current.warn) {
    anomalies.push({
      type: "Abnormal Charging Behaviour",
      severity: "MEDIUM",
      risk: 45,
      message: "Charging current is outside the expected range.",
    });
  }

  // 8. Multiple simultaneous anomalies (meta-anomaly)
  if (anomalies.length >= 3) {
    anomalies.push({
      type: "Multiple System Anomalies",
      severity: "CRITICAL",
      risk: 90,
      message: "Multiple EV system anomalies detected simultaneously.",
    });
  }

  return anomalies;
}

// ---------------------------------------------------------------------------
// Predictive maintenance
// ---------------------------------------------------------------------------
/**
 * Looks at trends (not just the latest reading) across recent history and
 * turns sustained abnormal trends into maintenance predictions.
 */
export function generatePredictiveMaintenance(current, history = []) {
  const predictions = [];
  const maintenanceItems = [];
  const combined = [...history, current];

  if (combined.length < 3) {
    return { predictions, maintenanceItems };
  }

  // Battery temperature consistently increasing
  const battTempRate = rateOfChangePerMinute(combined, "batteryTemperature");
  const avgBattTemp = average(combined, "batteryTemperature");
  if (battTempRate > 1.5 || (avgBattTemp !== null && avgBattTemp >= THRESHOLDS.batteryTemperature.warn)) {
    const risk = Math.min(95, Math.round(40 + battTempRate * 8 + Math.max(0, avgBattTemp - 35)));
    predictions.push("Battery thermal management inspection recommended.");
    maintenanceItems.push({
      issue: "Battery Cooling",
      risk,
      priority: risk >= 70 ? "HIGH" : risk >= 40 ? "MEDIUM" : "LOW",
      recommendation: "Inspect the battery cooling system.",
    });
  }

  // SOH decreasing / low
  const soh = current.soh ?? 100;
  if (soh <= THRESHOLDS.soh.warn) {
    const risk = Math.min(95, Math.round((THRESHOLDS.soh.warn - soh) * 3 + 40));
    predictions.push("Battery health degradation detected.");
    maintenanceItems.push({
      issue: "Battery Health",
      risk,
      priority: risk >= 70 ? "HIGH" : risk >= 40 ? "MEDIUM" : "LOW",
      recommendation: "Schedule a full battery health diagnostic.",
    });
  }

  // Voltage instability
  const voltageStdDev = stdDev(combined, "voltage");
  if (voltageStdDev >= 8) {
    const risk = Math.min(95, Math.round(30 + voltageStdDev * 3));
    predictions.push("Electrical system inspection recommended.");
    maintenanceItems.push({
      issue: "Electrical System",
      risk,
      priority: risk >= 70 ? "HIGH" : risk >= 40 ? "MEDIUM" : "LOW",
      recommendation: "Inspect wiring, connectors, and the battery management system.",
    });
  }

  // Motor temperature consistently high
  const avgMotorTemp = average(combined, "motorTemperature");
  if (avgMotorTemp !== null && avgMotorTemp >= THRESHOLDS.motorTemperature.warn) {
    const risk = Math.min(95, Math.round(35 + (avgMotorTemp - THRESHOLDS.motorTemperature.warn) * 2));
    predictions.push("Motor cooling system inspection recommended.");
    maintenanceItems.push({
      issue: "Motor Cooling",
      risk,
      priority: risk >= 70 ? "HIGH" : risk >= 40 ? "MEDIUM" : "LOW",
      recommendation: "Inspect the motor cooling and ventilation system.",
    });
  }

  return { predictions, maintenanceItems };
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------
function buildRecommendations(anomalies, riskLevel) {
  const recs = new Set();

  if (riskLevel === "CRITICAL") {
    recs.add("Stop the vehicle safely as soon as possible.");
    recs.add("Do not continue charging until inspected.");
  } else if (riskLevel === "HIGH") {
    recs.add("Reduce vehicle load and avoid rapid acceleration.");
    recs.add("Schedule an inspection as soon as possible.");
  } else if (riskLevel === "MEDIUM") {
    recs.add("Monitor the affected system closely.");
  }

  for (const a of anomalies) {
    if (a.type === "Battery Overheating") recs.add("Allow the battery to cool before resuming high loads.");
    if (a.type === "Motor Overheating") recs.add("Reduce speed to lower motor load.");
    if (a.type === "Voltage Instability") recs.add("Have the electrical system inspected.");
    if (a.type === "Excessive Current") recs.add("Avoid rapid acceleration to reduce current draw.");
    if (a.type === "Battery Health Degradation") recs.add("Schedule a battery health diagnostic.");
  }

  if (recs.size === 0) recs.add("No action required. Continue normal operation.");

  return Array.from(recs);
}

// ---------------------------------------------------------------------------
// Main entry point - combines everything into the AI output shape used by
// the API / Socket.IO events.
// ---------------------------------------------------------------------------
/**
 * @param {Object} current - latest telemetry reading
 * @param {Array} history - recent telemetry readings (oldest -> newest), NOT including `current`
 */
export function runAnalysis(current, history = []) {
  const { score, deductions } = calculateSafetyScore(current);
  const anomalies = detectAnomalies(current, history);
  const { predictions, maintenanceItems } = generatePredictiveMaintenance(current, history);
  const riskLevel = scoreToRiskLevel(score);
  const recommendations = buildRecommendations(anomalies, riskLevel);

  return {
    riskLevel,
    safetyScore: score,
    status: scoreToStatus(score),
    deductions,
    anomalies,
    predictions,
    recommendations,
    maintenanceItems,
  };
}
