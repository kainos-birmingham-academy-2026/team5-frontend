import type { Request, Response } from "express";
import type { JobRoleService } from "../services/JobRoleService";

export class JobRoleController {
	constructor(private jobRoleService: JobRoleService) {}

	async getAllJobRoles(req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await this.jobRoleService.getAllJobRoles();
			res.render("job-role-list.html", { jobRoles });
		} catch (error) {
			res.status(500).send("Failed to retrieve job roles");
		}
	}
}
