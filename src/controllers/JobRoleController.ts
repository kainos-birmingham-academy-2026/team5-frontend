import type { Request, Response } from "express";
import type {
	JobRoleFilters,
	JobRoleService,
} from "../services/JobRoleService";

const firstQueryValue = (value: unknown): string | undefined =>
	typeof value === "string" && value.trim() ? value.trim() : undefined;

const queryValues = (value: unknown): string[] =>
	(Array.isArray(value) ? value : [value]).filter(
		(item): item is string => typeof item === "string" && item.length > 0,
	);

const getFilters = (query: Request["query"]): JobRoleFilters => ({
	roleName: firstQueryValue(query.roleName),
	location: firstQueryValue(query.location),
	capability: queryValues(query.capability),
	band: queryValues(query.band),
	status: queryValues(query.status),
	closingDate: firstQueryValue(query.closingDate),
});

const getFilterQuery = (filters: JobRoleFilters): string => {
	const query = new URLSearchParams();
	if (filters.roleName) query.set("roleName", filters.roleName);
	if (filters.location) query.set("location", filters.location);
	for (const capability of filters.capability)
		query.append("capability", capability);
	for (const band of filters.band) query.append("band", band);
	for (const status of filters.status) query.append("status", status);
	if (filters.closingDate) query.set("closingDate", filters.closingDate);
	return query.toString();
};

export class JobRoleController {
	constructor(private jobRoleService: JobRoleService) {}

	async getHomePage(req: Request, res: Response): Promise<void> {
		const registrationSuccessMessage = req.session.registrationSuccessMessage;
		delete req.session.registrationSuccessMessage;

		try {
			const result = await this.jobRoleService.getAllJobRoles(1, 3);
			res.render("careers-home.njk", {
				featuredRoles: result.items,
				registrationSuccessMessage,
			});
		} catch (error) {
			console.error("Failed to retrieve featured job roles:", error);
			res.render("careers-home.njk", {
				featuredRoles: [],
				registrationSuccessMessage,
			});
		}
	}

	async getAllJobRoles(req: Request, res: Response): Promise<void> {
		try {
			const requestedPage = Number(req.query.page ?? 1);
			const page =
				Number.isInteger(requestedPage) && requestedPage > 0
					? requestedPage
					: 1;
			const filters = getFilters(req.query);
			const [result, filterOptions] = await Promise.all([
				this.jobRoleService.getAllJobRoles(page, 10, filters),
				this.jobRoleService.getFilterOptions(),
			]);
			res.render("job-role-list.njk", {
				jobRoles: result.items,
				pagination: result,
				filters,
				filterOptions,
				filterQuery: getFilterQuery(filters),
			});
		} catch (error) {
			console.error("Failed to retrieve job roles:", error);
			res.status(500).send("Failed to retrieve job roles");
		}
	}

	async getJobRoleInformation(
		req: Request<{ id: string }>,
		res: Response,
	): Promise<void> {
		const rawJobRoleId = req.params.id;
		await this.renderJobRoleDetail(rawJobRoleId, res);
	}

	async getJobRoleById(
		req: Request<{ jobRoleId: string }>,
		res: Response,
	): Promise<void> {
		const rawJobRoleId = req.params.jobRoleId;
		await this.renderJobRoleDetail(rawJobRoleId, res);
	}

	private async renderJobRoleDetail(
		rawJobRoleId: string | undefined,
		res: Response,
	): Promise<void> {
		const jobRoleId = Number.parseInt(rawJobRoleId ?? "", 10);
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
