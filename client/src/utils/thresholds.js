// Mirrors server/services/aiAnalysisService.js THRESHOLDS so metric cards
// can color themselves the same way the backend reasons about risk.
export const THRESHOLDS = {
  batteryTemperature: { warn: 40, critical: 50 },
  motorTemperature: { warn: 65, critical: 80 },
  voltage: { nominal: 390, warn: 25, critical: 45 },
  current: { warn: 80, critical: 120 },
  soc: { low: 15, critical: 5 },
  soh: { warn: 80, critical: 65 },
};

export function statusFor(field, value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "normal";

  switch (field) {
    case "batteryTemperature":
      if (value >= THRESHOLDS.batteryTemperature.critical) return "critical";
      if (value >= THRESHOLDS.batteryTemperature.warn) return "warn";
      return "normal";
    case "motorTemperature":
      if (value >= THRESHOLDS.motorTemperature.critical) return "critical";
      if (value >= THRESHOLDS.motorTemperature.warn) return "warn";
      return "normal";
    case "voltage": {
      const dev = Math.abs(value - THRESHOLDS.voltage.nominal);
      if (dev >= THRESHOLDS.voltage.critical) return "critical";
      if (dev >= THRESHOLDS.voltage.warn) return "warn";
      return "normal";
    }
    case "current":
      if (Math.abs(value) >= THRESHOLDS.current.critical) return "critical";
      if (Math.abs(value) >= THRESHOLDS.current.warn) return "warn";
      return "normal";
    case "soc":
      if (value <= THRESHOLDS.soc.critical) return "critical";
      if (value <= THRESHOLDS.soc.low) return "warn";
      return "normal";
    case "soh":
      if (value <= THRESHOLDS.soh.critical) return "critical";
      if (value <= THRESHOLDS.soh.warn) return "warn";
      return "normal";
    default:
      return "normal";
  }
}
