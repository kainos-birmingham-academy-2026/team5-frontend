import { Router, type Request, type Response } from "express";
import { JobRoleController } from "../controllers/JobRoleController";
import { requireAdmin, requireAuthentication } from "../middleware/authMiddleware";
import { JobRoleService } from "../services/JobRoleService";

const router = Router();

const service = new JobRoleService();
const controller = new JobRoleController(service);

router.get("/health", (_req, res) => {
	res.json({ status: "UP", time: new Date().toISOString() });
});

router.get("/", (req, res) =>
	controller.getHomePage(req, res),
);

router.get("/job-roles", (req, res) =>
	controller.getAllJobRoles(req, res),
);
router.get(
	"/job-roles/new",
	requireAuthentication,
	requireAdmin,
	(req, res) => controller.showNewJobRoleForm(req, res),
);
router.post(
	"/job-roles/new",
	requireAuthentication,
	requireAdmin,
	(req, res) => controller.createJobRole(req, res),
);
router.get(
	"/job-roles/:id",
	requireAuthentication,
	(req: Request<{ id: string }>, res: Response) =>
		controller.getJobRoleInformation(req, res),
);
router.get(
	"/job-roles/:id/edit",
	requireAuthentication,
	requireAdmin,
	(req: Request<{ id: string }>, res: Response) =>
		controller.showEditJobRoleForm(req, res),
);
router.post(
	"/job-roles/:id/edit",
	requireAuthentication,
	requireAdmin,
	(req: Request<{ id: string }>, res: Response) =>
		controller.updateJobRole(req, res),
);
router.post(
	"/job-roles/:id/delete",
	requireAuthentication,
	requireAdmin,
	(req: Request<{ id: string }>, res: Response) =>
		controller.deleteJobRole(req, res),
);

export default router;
