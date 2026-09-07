import { Router } from "express";
import {
  getSimulatorStatus,
  startSimulator,
  stopSimulator,
  resetSimulator,
  setSimulatorMode,
  setSimulatorSpeed,
  setManualOverride,
  clearManualOverrides,
} from "../controllers/simulatorController.js";

const router = Router();

router.get("/status", getSimulatorStatus);
router.post("/start", startSimulator);
router.post("/stop", stopSimulator);
router.post("/reset", resetSimulator);
router.post("/mode", setSimulatorMode);
router.post("/speed", setSimulatorSpeed);
router.post("/override", setManualOverride);
router.post("/override/clear", clearManualOverrides);

export default router;
