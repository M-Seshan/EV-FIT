import Maintenance from "../models/Maintenance.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const DEFAULT_VEHICLE_ID = "EV-001";

export const getMaintenance = asyncHandler(async (req, res) => {
  const vehicleId = req.query.vehicleId || DEFAULT_VEHICLE_ID;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
  const maintenance = await Maintenance.find({ vehicleId }).sort({ createdAt: -1 }).limit(limit);
  res.json({ success: true, data: maintenance });
});
