import { Router } from "express";

const router = Router();

import { JobRoleController } from "../controllers/JobRoleController";
import { JobRoleService } from "../services/JobRoleService";

const service = new JobRoleService();
const controller = new JobRoleController(service);

router.get("/health", (req, res) => {
	res.json({ status: "UP", time: new Date().toISOString() });
});

router.get("/", (req, res) => controller.getHomePage(req, res));

router.get("/login", (_req, res) => res.render("login.njk"));

router.get("/job-roles", (req, res) => controller.getAllJobRoles(req, res));
router.get("/job-roles/:jobRoleId", (req, res) => controller.getJobRoleById(req, res));

export default router;
