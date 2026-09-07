import Alert from "../models/Alert.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const DEFAULT_VEHICLE_ID = "EV-001";

export const getAlerts = asyncHandler(async (req, res) => {
  const vehicleId = req.query.vehicleId || DEFAULT_VEHICLE_ID;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
  const filter = { vehicleId };
  if (req.query.severity) filter.severity = req.query.severity;

  const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(limit);
  res.json({ success: true, data: alerts });
});

export const acknowledgeAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, { acknowledged: true }, { new: true });
  if (!alert) {
    return res.status(404).json({ success: false, message: "Alert not found" });
  }
  res.json({ success: true, data: alert });
});
