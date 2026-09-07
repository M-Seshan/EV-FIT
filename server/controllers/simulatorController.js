import { asyncHandler } from "../middleware/errorHandler.js";
import { MODES } from "../simulator/telemetrySimulator.js";

function getManager(req) {
  return req.app.get("simulatorManager");
}

export const getSimulatorStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, data: getManager(req).getStatus() });
});

export const startSimulator = asyncHandler(async (req, res) => {
  getManager(req).start();
  res.json({ success: true, data: getManager(req).getStatus() });
});

export const stopSimulator = asyncHandler(async (req, res) => {
  getManager(req).stop();
  res.json({ success: true, data: getManager(req).getStatus() });
});

export const resetSimulator = asyncHandler(async (req, res) => {
  getManager(req).reset();
  res.json({ success: true, data: getManager(req).getStatus() });
});

export const setSimulatorMode = asyncHandler(async (req, res) => {
  const { mode } = req.body;
  if (!MODES[mode]) {
    return res.status(400).json({
      success: false,
      message: `Invalid mode. Must be one of: ${Object.values(MODES).join(", ")}`,
    });
  }
  getManager(req).setMode(mode);
  res.json({ success: true, data: getManager(req).getStatus() });
});

export const setSimulatorSpeed = asyncHandler(async (req, res) => {
  const { speedMultiplier } = req.body;
  getManager(req).setSpeed(speedMultiplier);
  res.json({ success: true, data: getManager(req).getStatus() });
});

export const setManualOverride = asyncHandler(async (req, res) => {
  const { field, value } = req.body;
  const allowedFields = ["batteryTemperature", "voltage", "current", "speed"];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({
      success: false,
      message: `field must be one of: ${allowedFields.join(", ")}`,
    });
  }
  getManager(req).setManualOverride(field, value === null ? null : Number(value));
  res.json({ success: true, message: `Manual override set for ${field}` });
});

export const clearManualOverrides = asyncHandler(async (req, res) => {
  getManager(req).clearManualOverrides();
  res.json({ success: true, message: "Manual overrides cleared" });
});
