import Analysis from "../models/Analysis.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getLatestAnalysis = asyncHandler(async (req, res) => {
  const vehicleId = req.params.vehicleId;
  const latest = await Analysis.findOne({ vehicleId }).sort({ createdAt: -1 });
  res.json({ success: true, data: latest });
});

export const getAnalysisHistory = asyncHandler(async (req, res) => {
  const vehicleId = req.params.vehicleId;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
  const history = await Analysis.find({ vehicleId }).sort({ createdAt: -1 }).limit(limit);
  res.json({ success: true, data: history.reverse() });
});
