import { Router } from "express";
import { getLatestAnalysis, getAnalysisHistory } from "../controllers/analysisController.js";

const router = Router();

router.get("/:vehicleId", getLatestAnalysis);
router.get("/:vehicleId/history", getAnalysisHistory);

export default router;
