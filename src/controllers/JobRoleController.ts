import axios from "axios";
import type { Request, Response } from "express";
import type {
	JobRole,
	JobRoleFilters,
	JobRoleFormInput,
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

type JobRoleFormValues = {
	roleName: string;
	location: string;
	capabilityId: string;
	bandId: string;
	closingDate: string;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: string;
	status: string;
};

const emptyFormValues: JobRoleFormValues = {
	roleName: "",
	location: "",
	capabilityId: "",
	bandId: "",
	closingDate: "",
	description: "",
	responsibilities: "",
	sharepointUrl: "",
	numberOfOpenPositions: "",
	status: "",
};

const getFormValues = (body: Request["body"]): JobRoleFormValues => ({
	roleName: String(body?.roleName ?? "").trim(),
	location: String(body?.location ?? "").trim(),
	capabilityId: String(body?.capabilityId ?? "").trim(),
	bandId: String(body?.bandId ?? "").trim(),
	closingDate: String(body?.closingDate ?? "").trim(),
	description: String(body?.description ?? "").trim(),
	responsibilities: String(body?.responsibilities ?? "").trim(),
	sharepointUrl: String(body?.sharepointUrl ?? "").trim(),
	numberOfOpenPositions: String(body?.numberOfOpenPositions ?? "").trim(),
	status: String(body?.status ?? "").trim(),
});

const jobRoleToFormValues = (jobRole: JobRole): JobRoleFormValues => ({
	roleName: jobRole.roleName ?? "",
	location: jobRole.location ?? "",
	capabilityId: jobRole.capabilityId ? String(jobRole.capabilityId) : "",
	bandId: jobRole.bandId ? String(jobRole.bandId) : "",
	closingDate: jobRole.closingDate ? String(jobRole.closingDate) : "",
	description: jobRole.description ?? "",
	responsibilities: jobRole.responsibilities ?? "",
	sharepointUrl: jobRole.sharepointUrl ?? "",
	numberOfOpenPositions:
		jobRole.numberOfOpenPositions != null
			? String(jobRole.numberOfOpenPositions)
			: "",
	status: jobRole.status ?? "",
});

const validateJobRoleForm = (values: JobRoleFormValues): string[] => {
	const errors: string[] = [];
	if (!values.roleName) errors.push("Enter a job role name");
	if (!values.location) errors.push("Enter a location");
	if (!values.capabilityId) errors.push("Select a capability");
	if (!values.bandId) errors.push("Select a band");
	if (!values.closingDate) errors.push("Enter a closing date");
	return errors;
};

const toJobRoleFormInput = (values: JobRoleFormValues): JobRoleFormInput => {
	const input: JobRoleFormInput = {
		roleName: values.roleName,
		location: values.location,
		capabilityId: Number(values.capabilityId),
		bandId: Number(values.bandId),
		closingDate: values.closingDate,
	};

	if (values.description) input.description = values.description;
	if (values.responsibilities)
		input.responsibilities = values.responsibilities;
	if (values.sharepointUrl) input.sharepointUrl = values.sharepointUrl;
	if (values.numberOfOpenPositions)
		input.numberOfOpenPositions = Number(values.numberOfOpenPositions);
	if (values.status) input.status = values.status;

	return input;
};

const apiErrorMessage = (error: unknown): string | undefined =>
	axios.isAxiosError(error)
		? (error.response?.data as { error?: string } | undefined)?.error
		: undefined;

export class JobRoleController {
	constructor(private jobRoleService: JobRoleService) {}

	async getHomePage(req: Request, res: Response): Promise<void> {
		const registrationSuccessMessage = req.session.registrationSuccessMessage;
		delete req.session.registrationSuccessMessage;
		const jwtToken = req.session.jwtToken;

		try {
			const result = await this.jobRoleService.getAllJobRoles(
				1,
				4,
				undefined,
				jwtToken,
			);
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
			const jwtToken = req.session.jwtToken;
			const requestedPage = Number(req.query.page ?? 1);
			const page =
				Number.isInteger(requestedPage) && requestedPage > 0
					? requestedPage
					: 1;
			const filters = getFilters(req.query);
			const [result, filterOptions] = await Promise.all([
				this.jobRoleService.getAllJobRoles(page, 10, filters, jwtToken),
				this.jobRoleService.getFilterOptions(jwtToken),
			]);
			res.render("job-role-list.njk", {
				jobRoles: result.items,
				pagination: result,
				filters,
				filterOptions,
				filterQuery: getFilterQuery(filters),
				...this.consumeFlashMessages(req),
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
		await this.renderJobRoleDetail(rawJobRoleId, req, res);
	}

	async getJobRoleById(
		req: Request<{ jobRoleId: string }>,
		res: Response,
	): Promise<void> {
		const rawJobRoleId = req.params.jobRoleId;
		await this.renderJobRoleDetail(rawJobRoleId, req, res);
	}

	async showNewJobRoleForm(req: Request, res: Response): Promise<void> {
		try {
			const referenceOptions = await this.jobRoleService.getReferenceOptions(
				req.session.jwtToken,
			);
			res.render("job-role-form.njk", {
				mode: "create",
				formValues: emptyFormValues,
				referenceOptions,
			});
		} catch (error) {
			console.error("Failed to load job role reference data:", error);
			res.status(500).send("Failed to load job role form");
		}
	}

	async createJobRole(req: Request, res: Response): Promise<void> {
		const values = getFormValues(req.body);
		const errors = validateJobRoleForm(values);

		if (errors.length) {
			await this.renderJobRoleForm(req, res, "create", values, undefined, {
				status: 400,
				errorMessage: errors.join(". "),
			});
			return;
		}

		try {
			const created = await this.jobRoleService.createJobRole(
				toJobRoleFormInput(values),
				req.session.jwtToken,
			);
			req.session.flashSuccess = `${created.roleName} was created.`;
			res.redirect(`/job-roles/${created.jobRoleId}`);
		} catch (error) {
			console.error("Failed to create job role:", error);
			await this.renderJobRoleForm(req, res, "create", values, undefined, {
				status: 400,
				errorMessage:
					apiErrorMessage(error) ??
					"Unable to create job role. Please try again.",
			});
		}
	}

	async showEditJobRoleForm(
		req: Request<{ id: string }>,
		res: Response,
	): Promise<void> {
		const jobRoleId = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(jobRoleId)) {
			res.status(400).send("Invalid job role id");
			return;
		}

		try {
			const [jobRole, referenceOptions, filterOptions] = await Promise.all([
				this.jobRoleService.getJobRoleById(jobRoleId, req.session.jwtToken),
				this.jobRoleService.getReferenceOptions(req.session.jwtToken),
				this.jobRoleService.getFilterOptions(req.session.jwtToken),
			]);

			if (!jobRole) {
				res.status(404).send("Job role not found");
				return;
			}

			res.render("job-role-form.njk", {
				mode: "edit",
				jobRoleId,
				formValues: jobRoleToFormValues(jobRole),
				referenceOptions,
				statusOptions: filterOptions.statuses,
			});
		} catch (error) {
			console.error("Failed to load job role for editing:", error);
			res.status(500).send("Failed to load job role form");
		}
	}

	async updateJobRole(
		req: Request<{ id: string }>,
		res: Response,
	): Promise<void> {
		const jobRoleId = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(jobRoleId)) {
			res.status(400).send("Invalid job role id");
			return;
		}

		const values = getFormValues(req.body);
		const errors = validateJobRoleForm(values);
		if (!values.status) errors.push("Select a status");

		if (errors.length) {
			await this.renderJobRoleForm(req, res, "edit", values, jobRoleId, {
				status: 400,
				errorMessage: errors.join(". "),
			});
			return;
		}

		try {
			const updated = await this.jobRoleService.updateJobRole(
				jobRoleId,
				toJobRoleFormInput(values),
				req.session.jwtToken,
			);
			req.session.flashSuccess = `${updated.roleName} was updated.`;
			res.redirect(`/job-roles/${jobRoleId}`);
		} catch (error) {
			console.error("Failed to update job role:", error);
			await this.renderJobRoleForm(req, res, "edit", values, jobRoleId, {
				status: 400,
				errorMessage:
					apiErrorMessage(error) ??
					"Unable to update job role. Please try again.",
			});
		}
	}

	async deleteJobRole(
		req: Request<{ id: string }>,
		res: Response,
	): Promise<void> {
		const jobRoleId = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(jobRoleId)) {
			res.status(400).send("Invalid job role id");
			return;
		}

		try {
			await this.jobRoleService.deleteJobRole(jobRoleId, req.session.jwtToken);
			req.session.flashSuccess = "Job role deleted.";
			res.redirect("/job-roles");
		} catch (error) {
			console.error("Failed to delete job role:", error);
			req.session.flashError =
				apiErrorMessage(error) ?? "Unable to delete job role. Please try again.";
			res.redirect(`/job-roles/${jobRoleId}`);
		}
	}

	private consumeFlashMessages(req: Request): {
		flashSuccess?: string;
		flashError?: string;
	} {
		const flashSuccess = req.session.flashSuccess;
		const flashError = req.session.flashError;
		delete req.session.flashSuccess;
		delete req.session.flashError;
		return { flashSuccess, flashError };
	}

	private async renderJobRoleForm(
		req: Request,
		res: Response,
		mode: "create" | "edit",
		formValues: JobRoleFormValues,
		jobRoleId: number | undefined,
		options: { status: number; errorMessage: string },
	): Promise<void> {
		const jwtToken = req.session.jwtToken;
		const [referenceOptions, filterOptions] = await Promise.all([
			this.jobRoleService
				.getReferenceOptions(jwtToken)
				.catch(() => ({ capabilities: [], bands: [] })),
			this.jobRoleService
				.getFilterOptions(jwtToken)
				.catch(() => ({ capabilities: [], bands: [], statuses: [] })),
		]);

		res.status(options.status).render("job-role-form.njk", {
			mode,
			jobRoleId,
			formValues,
			referenceOptions,
			statusOptions: filterOptions.statuses,
			errorMessage: options.errorMessage,
		});
	}

	private async renderJobRoleDetail(
		rawJobRoleId: string | undefined,
		req: Request,
		res: Response,
	): Promise<void> {
		const jobRoleId = Number.parseInt(rawJobRoleId ?? "", 10);
		if (Number.isNaN(jobRoleId)) {
			res.status(400).send("Invalid job role id");
			return;
		}

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(
				jobRoleId,
				req.session.jwtToken,
			);
			if (!jobRole) {
				res.status(404).render("job-role-detail.njk", { jobRole: null });
				return;
			}

			res.render("job-role-detail.njk", {
				jobRole,
				...this.consumeFlashMessages(req),
			});
		} catch (error) {
			console.error("Failed to retrieve job role:", error);
			res.status(500).send("Failed to retrieve job role");
		}
	}
}
