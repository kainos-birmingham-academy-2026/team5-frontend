import type { Request, Response } from "express";
import type { JobRoleService } from "../services/JobRoleService";

export class JobRoleController {
	constructor(private jobRoleService: JobRoleService) {}

	async getHomePage(req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await this.jobRoleService.getAllJobRoles();
			res.render("careers-home.njk", {
				featuredRoles: jobRoles.slice(0, 3),
			});
		} catch (error) {
			console.error("Failed to retrieve featured job roles:", error);
			res.render("careers-home.njk", { featuredRoles: [] });
		}
	}

	async getAllJobRoles(req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await this.jobRoleService.getAllJobRoles();
			res.render("job-role-list.njk", { jobRoles });
		} catch (error) {
			console.error("Failed to retrieve job roles:", error);
			res.status(500).send("Failed to retrieve job roles");
		}
	}

	async getJobRoleById(req: Request, res: Response): Promise<void> {
		const rawJobRoleId = Array.isArray(req.params.jobRoleId)
			? req.params.jobRoleId[0]
			: req.params.jobRoleId;
		const jobRoleId = Number.parseInt(rawJobRoleId, 10);
		if (Number.isNaN(jobRoleId)) {
			res.status(400).send("Invalid job role id");
			return;
		}

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(jobRoleId);
			if (!jobRole) {
				res.status(404).render("job-role-detail.njk", { jobRole: null });
				return;
			}

			res.render("job-role-detail.njk", { jobRole });
		} catch (error) {
			console.error("Failed to retrieve job role:", error);
			res.status(500).send("Failed to retrieve job role");
		}
	}
}
