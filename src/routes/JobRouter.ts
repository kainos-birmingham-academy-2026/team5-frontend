import { Router } from "express";
import { JobRoleController } from "../controllers/JobRoleController";
import { requireAuthentication } from "../middleware/authMiddleware";
import { JobRoleService } from "../services/JobRoleService";

const router = Router();

const service = new JobRoleService();
const controller = new JobRoleController(service);

router.get("/health", (_req, res) => {
	res.json({ status: "UP", time: new Date().toISOString() });
});

router.get("/", requireAuthentication, (req, res) =>
	controller.getHomePage(req, res),
);

router.get("/job-roles", requireAuthentication, (req, res) =>
	controller.getAllJobRoles(req, res),
);
router.get("/job-roles/:id", requireAuthentication, (req, res) =>
	controller.getJobRoleInformation(req, res),
);

export default router;
