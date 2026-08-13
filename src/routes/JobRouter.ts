import { Router } from "express";
import { JobRoleController } from "../controllers/JobRoleController";
import { JobRoleService } from "../services/JobRoleService";

const router = Router();

const service = new JobRoleService();
const controller = new JobRoleController(service);

router.get("/health", (_req, res) => {
	res.json({ status: "UP", time: new Date().toISOString() });
});

router.get("/", (req, res) => controller.getHomePage(req, res));

router.get("/job-roles", (req, res) => controller.getAllJobRoles(req, res));
router.get("/job-roles/:id", (req, res) =>
	controller.getJobRoleInformation(req, res),
);

export default router;
