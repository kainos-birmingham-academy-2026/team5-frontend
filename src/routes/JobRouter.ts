import { Router } from "express";

const router = Router();

import { JobRoleController } from "../controllers/JobRoleController";
import { JobRoleService } from "../services/JobRoleService";

const service = new JobRoleService();
const controller = new JobRoleController(service);

router.get("/health", (req, res) => {
	res.json({ status: "UP", time: new Date().toISOString() });
});

router.get("/", (req, res) => {
	res.send("<h1>Hello World</h1>");
});

router.get("/job-roles", (req, res) => controller.getAllJobRoles(req, res));

export default router;
