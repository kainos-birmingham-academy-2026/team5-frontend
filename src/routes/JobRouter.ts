import multer from "multer";
import { Router, type Request, type Response } from "express";
import { JobRoleController } from "../controllers/JobRoleController";
import {
	requireApplicant,
	requireAuthentication,
} from "../middleware/authMiddleware";
import { JobRoleService } from "../services/JobRoleService";

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (
		_req: Request,
		file: { mimetype: string },
		callback: (error: Error | null, acceptFile?: boolean) => void,
	) => {
		const allowedMimeTypes = new Set([
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		]);

		if (!allowedMimeTypes.has(file.mimetype)) {
			callback(new Error("CV must be a PDF, DOC, or DOCX file"));
			return;
		}

		callback(null, true);
	},
});

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
router.get("/job-roles/:id", requireAuthentication, (req: Request<{ id: string }>, res: Response) =>
	controller.getJobRoleInformation(req, res),
);
router.get(
	"/job-roles/:id/apply",
	requireAuthentication,
	requireApplicant,
	(req: Request<{ id: string }>, res: Response) =>
		controller.getApplicationForm(req, res),
);
router.post(
	"/job-roles/:id/apply",
	requireAuthentication,
	requireApplicant,
	upload.single("cv"),
	(req: Request<{ id: string }>, res: Response) =>
		controller.submitApplication(req, res),
);

export default router;
