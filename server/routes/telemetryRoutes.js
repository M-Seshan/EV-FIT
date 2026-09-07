import { Router } from "express";
import {
  getLatestTelemetry,
  getTelemetryHistory,
  postTelemetry,
} from "../controllers/telemetryController.js";

const router = Router();

router.get("/latest", getLatestTelemetry);
router.get("/history", getTelemetryHistory);
router.post("/", postTelemetry);

export default router;
