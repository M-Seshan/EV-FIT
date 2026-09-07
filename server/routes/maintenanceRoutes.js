import { Router } from "express";
import { getMaintenance } from "../controllers/maintenanceController.js";

const router = Router();

router.get("/", getMaintenance);

export default router;
