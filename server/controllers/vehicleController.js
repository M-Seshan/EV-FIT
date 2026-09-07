import Vehicle from "../models/Vehicle.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().sort({ createdAt: -1 });
  res.json({ success: true, data: vehicles });
});

export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ vehicleId: req.params.id });
  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }
  res.json({ success: true, data: vehicle });
});
