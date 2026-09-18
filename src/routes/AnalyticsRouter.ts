import { Router } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";
import {
	requireAdmin,
	requireAuthentication,
} from "../middleware/authMiddleware";
import { AnalyticsService } from "../services/AnalyticsService";

const router = Router();

const controller = new AnalyticsController(new AnalyticsService());

router.get(
	"/admin/analytics",
	requireAuthentication,
	requireAdmin,
	(req, res) => controller.getDashboard(req, res),
);

export default router;
