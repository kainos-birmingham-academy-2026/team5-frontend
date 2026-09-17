import multer from "multer";
import {
	Router,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { JobRoleController } from "../controllers/JobRoleController";
import {
	requireApplicant,
	requireAuthentication,
} from "../middleware/authMiddleware";
import { JobRoleService } from "../services/JobRoleService";

const INVALID_CV_TYPE_MESSAGE = "CV must be a PDF, DOC, or DOCX file";

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
			callback(new Error(INVALID_CV_TYPE_MESSAGE));
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
router.get(
	"/job-roles/:id",
	requireAuthentication,
	(req: Request<{ id: string }>, res: Response) =>
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


router.use(
	"/job-roles/:id/apply",
	(
		error: unknown,
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction,
	) => {
		const isKnownUploadError =
			error instanceof multer.MulterError ||
			(error instanceof Error && error.message === INVALID_CV_TYPE_MESSAGE);
		if (!isKnownUploadError) {
			next(error);
			return;
		}

		const jobRoleId = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(jobRoleId)) {
			next(error);
			return;
		}

		req.session.applicationErrorMessage =
			error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
				? "CV must not exceed 5 MB"
				: error.message;
		res.redirect(`/job-roles/${jobRoleId}/apply`);
	},
);

export default router;
