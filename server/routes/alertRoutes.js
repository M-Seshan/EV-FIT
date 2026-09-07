import { Router } from "express";
import { getAlerts, acknowledgeAlert } from "../controllers/alertController.js";

const router = Router();

router.get("/", getAlerts);
router.patch("/:id/acknowledge", acknowledgeAlert);

export default router;
