import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../src/controllers/JobRoleController";
import type { JobRoleService } from "../src/services/JobRoleService";

const createResponse = () => {
	const response = {
		status: vi.fn(),
		render: vi.fn(),
		send: vi.fn(),
	} as unknown as Response;
	vi.mocked(response.status).mockReturnValue(response);
	return response;
};

describe("JobRoleController filters", () => {
	it("forwards active filters and renders options with a pagination query", async () => {
		const getAllJobRoles = vi.fn().mockResolvedValue({
			items: [],
			page: 2,
			pageSize: 10,
			totalItems: 0,
			totalPages: 0,
		});
		const filterOptions = {
			capabilities: ["Data", "Engineering"],
			bands: ["Band 1", "Band 2"],
			statuses: ["Closed", "Open"],
		};
		const getFilterOptions = vi.fn().mockResolvedValue(filterOptions);
		const controller = new JobRoleController({
			getAllJobRoles,
			getFilterOptions,
		} as unknown as JobRoleService);
		const req = {
			query: {
				page: "2",
				roleName: " engineer ",
				location: "Belfast",
				capability: ["Data", "Engineering"],
				band: "Band 2",
				status: "Open",
				closingDate: "2027-12-31",
			},
			session: {},
		} as unknown as Request;
		const res = { render: vi.fn() } as unknown as Response;

		await controller.getAllJobRoles(req, res);

		const filters = {
			roleName: "engineer",
			location: "Belfast",
			capability: ["Data", "Engineering"],
			band: ["Band 2"],
			status: ["Open"],
			closingDate: "2027-12-31",
		};
		expect(getAllJobRoles).toHaveBeenCalledWith(2, 10, filters, undefined);
		expect(getFilterOptions).toHaveBeenCalledWith(undefined);
		expect(res.render).toHaveBeenCalledWith("job-role-list.njk", {
			jobRoles: [],
			pagination: expect.objectContaining({ page: 2 }),
			filters,
			filterOptions,
			filterQuery:
				"roleName=engineer&location=Belfast&capability=Data&capability=Engineering&band=Band+2&status=Open&closingDate=2027-12-31",
		});
	});

	it("returns a server error when job roles cannot be retrieved", async () => {
		const getAllJobRoles = vi
			.fn()
			.mockRejectedValue(new Error("API unavailable"));
		const controller = new JobRoleController({
			getAllJobRoles,
			getFilterOptions: vi.fn(),
		} as unknown as JobRoleService);
		const request = { query: {}, session: {} } as unknown as Request;
		const response = createResponse();
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		await controller.getAllJobRoles(request, response);

		expect(response.status).toHaveBeenCalledWith(500);
		expect(response.send).toHaveBeenCalledWith("Failed to retrieve job roles");
		consoleError.mockRestore();
	});
});

describe("JobRoleController home page", () => {
	it("passes and consumes the registration success message", async () => {
		const getAllJobRoles = vi.fn().mockResolvedValue({ items: [] });
		const controller = new JobRoleController({
			getAllJobRoles,
		} as unknown as JobRoleService);
		const session: { registrationSuccessMessage?: string } = {
			registrationSuccessMessage: "Account successfully created.",
		};
		const req = {
			session,
		} as unknown as Request;
		const res = { render: vi.fn() } as unknown as Response;

		await controller.getHomePage(req, res);

		expect(res.render).toHaveBeenCalledWith("careers-home.njk", {
			featuredRoles: [],
			registrationSuccessMessage: "Account successfully created.",
		});
		expect(session.registrationSuccessMessage).toBeUndefined();
	});

	it("renders no featured roles when the service fails", async () => {
		const getAllJobRoles = vi
			.fn()
			.mockRejectedValue(new Error("API unavailable"));
		const controller = new JobRoleController({
			getAllJobRoles,
		} as unknown as JobRoleService);
		const request = { session: {} } as unknown as Request;
		const response = createResponse();
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		await controller.getHomePage(request, response);

		expect(response.render).toHaveBeenCalledWith("careers-home.njk", {
			featuredRoles: [],
			registrationSuccessMessage: undefined,
		});
		consoleError.mockRestore();
	});
});

describe("JobRoleController job role details", () => {
	it("renders a job role requested by id", async () => {
		const jobRole = { jobRoleId: 12, roleName: "Software Engineer" };
		const getJobRoleById = vi.fn().mockResolvedValue(jobRole);
		const controller = new JobRoleController({
			getJobRoleById,
		} as unknown as JobRoleService);
		const request = {
			params: { id: "12" },
			session: {},
		} as unknown as Request<{
			id: string;
		}>;
		const response = createResponse();

		await controller.getJobRoleInformation(request, response);

		expect(getJobRoleById).toHaveBeenCalledWith(12, undefined);
		expect(response.render).toHaveBeenCalledWith("job-role-detail.njk", {
			jobRole,
		});
	});

	it("rejects an invalid job role id without calling the service", async () => {
		const getJobRoleById = vi.fn();
		const controller = new JobRoleController({
			getJobRoleById,
		} as unknown as JobRoleService);
		const request = {
			params: { jobRoleId: "invalid" },
			session: {},
		} as unknown as Request<{ jobRoleId: string }>;
		const response = createResponse();

		await controller.getJobRoleById(request, response);

		expect(getJobRoleById).not.toHaveBeenCalled();
		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.send).toHaveBeenCalledWith("Invalid job role id");
	});

	it("renders the not-found state when no job role matches", async () => {
		const controller = new JobRoleController({
			getJobRoleById: vi.fn().mockResolvedValue(null),
		} as unknown as JobRoleService);
		const request = {
			params: { id: "99" },
			session: {},
		} as unknown as Request<{
			id: string;
		}>;
		const response = createResponse();

		await controller.getJobRoleInformation(request, response);

		expect(response.status).toHaveBeenCalledWith(404);
		expect(response.render).toHaveBeenCalledWith("job-role-detail.njk", {
			jobRole: null,
		});
	});

	it("returns a server error when a job role cannot be retrieved", async () => {
		const controller = new JobRoleController({
			getJobRoleById: vi.fn().mockRejectedValue(new Error("API unavailable")),
		} as unknown as JobRoleService);
		const request = {
			params: { id: "12" },
			session: {},
		} as unknown as Request<{
			id: string;
		}>;
		const response = createResponse();
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		await controller.getJobRoleInformation(request, response);

		expect(response.status).toHaveBeenCalledWith(500);
		expect(response.send).toHaveBeenCalledWith("Failed to retrieve job role");
		consoleError.mockRestore();
	});
});

const axiosError = (message: string) =>
	Object.assign(new Error(message), {
		isAxiosError: true,
		response: { data: { error: message } },
	});

describe("JobRoleController admin job role form", () => {
	it("renders the new job role form with reference options", async () => {
		const referenceOptions = {
			capabilities: [{ capabilityId: 1, capabilityName: "Engineering" }],
			bands: [{ nameId: 2, bandName: "Band 2" }],
		};
		const getReferenceOptions = vi.fn().mockResolvedValue(referenceOptions);
		const controller = new JobRoleController({
			getReferenceOptions,
		} as unknown as JobRoleService);
		const request = { session: {} } as unknown as Request;
		const response = { render: vi.fn() } as unknown as Response;

		await controller.showNewJobRoleForm(request, response);

		expect(response.render).toHaveBeenCalledWith("job-role-form.njk", {
			mode: "create",
			formValues: expect.objectContaining({ roleName: "" }),
			referenceOptions,
		});
	});

	it("re-renders the create form with validation errors and no service call", async () => {
		const createJobRole = vi.fn();
		const controller = new JobRoleController({
			createJobRole,
			getReferenceOptions: vi.fn().mockResolvedValue({
				capabilities: [],
				bands: [],
			}),
			getFilterOptions: vi.fn().mockResolvedValue({
				capabilities: [],
				bands: [],
				statuses: [],
			}),
		} as unknown as JobRoleService);
		const request = { body: {}, session: {} } as unknown as Request;
		const response = createResponse();

		await controller.createJobRole(request, response);

		expect(createJobRole).not.toHaveBeenCalled();
		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.render).toHaveBeenCalledWith(
			"job-role-form.njk",
			expect.objectContaining({ mode: "create" }),
		);
	});

	it("logs when reference and filter options fail while re-rendering the form", async () => {
		const error = new Error("api down");
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		const controller = new JobRoleController({
			createJobRole: vi.fn(),
			getReferenceOptions: vi.fn().mockRejectedValue(error),
			getFilterOptions: vi.fn().mockRejectedValue(error),
		} as unknown as JobRoleService);
		const request = { body: {}, session: {} } as unknown as Request;
		const response = createResponse();

		await controller.createJobRole(request, response);

		expect(consoleError).toHaveBeenCalledWith(
			"Failed to load job role reference data:",
			error,
		);
		expect(consoleError).toHaveBeenCalledWith(
			"Failed to load job role filter options:",
			error,
		);
		expect(response.render).toHaveBeenCalledWith(
			"job-role-form.njk",
			expect.objectContaining({
				mode: "create",
				referenceOptions: { capabilities: [], bands: [] },
				statusOptions: [],
			}),
		);
		consoleError.mockRestore();
	});

	it("creates a job role and redirects to its detail page", async () => {
		const createJobRole = vi
			.fn()
			.mockResolvedValue({ jobRoleId: 5, roleName: "QA Engineer" });
		const controller = new JobRoleController({
			createJobRole,
		} as unknown as JobRoleService);
		const session: { jwtToken?: string; flashSuccess?: string } = {
			jwtToken: "token",
		};
		const request = {
			body: {
				roleName: "QA Engineer",
				location: "Remote",
				capabilityId: "1",
				bandId: "2",
				closingDate: "2027-10-10",
			},
			session,
		} as unknown as Request;
		const response = { redirect: vi.fn() } as unknown as Response;

		await controller.createJobRole(request, response);

		expect(createJobRole).toHaveBeenCalledWith(
			{
				roleName: "QA Engineer",
				location: "Remote",
				capabilityId: 1,
				bandId: 2,
				closingDate: "2027-10-10",
			},
			"token",
		);
		expect(response.redirect).toHaveBeenCalledWith("/job-roles/5");
		expect(session.flashSuccess).toBe("QA Engineer was created.");
	});

	it("re-renders the create form with the API error message when the service throws", async () => {
		const createJobRole = vi
			.fn()
			.mockRejectedValue(axiosError("Capability 1 does not exist"));
		const controller = new JobRoleController({
			createJobRole,
			getReferenceOptions: vi.fn().mockResolvedValue({
				capabilities: [],
				bands: [],
			}),
			getFilterOptions: vi.fn().mockResolvedValue({
				capabilities: [],
				bands: [],
				statuses: [],
			}),
		} as unknown as JobRoleService);
		const request = {
			body: {
				roleName: "QA Engineer",
				location: "Remote",
				capabilityId: "1",
				bandId: "2",
				closingDate: "2027-10-10",
			},
			session: {},
		} as unknown as Request;
		const response = createResponse();
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		await controller.createJobRole(request, response);

		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.render).toHaveBeenCalledWith(
			"job-role-form.njk",
			expect.objectContaining({ errorMessage: "Capability 1 does not exist" }),
		);
		consoleError.mockRestore();
	});

	it("renders the edit form pre-populated with the existing job role", async () => {
		const jobRole = {
			jobRoleId: 5,
			roleName: "QA Engineer",
			location: "Remote",
			capabilityId: 1,
			bandId: 2,
			closingDate: "2027-10-10",
			status: "Open",
		};
		const controller = new JobRoleController({
			getJobRoleById: vi.fn().mockResolvedValue(jobRole),
			getReferenceOptions: vi.fn().mockResolvedValue({
				capabilities: [],
				bands: [],
			}),
			getFilterOptions: vi
				.fn()
				.mockResolvedValue({ capabilities: [], bands: [], statuses: ["Open", "Closed"] }),
		} as unknown as JobRoleService);
		const request = {
			params: { id: "5" },
			session: {},
		} as unknown as Request<{ id: string }>;
		const response = { status: vi.fn(), render: vi.fn(), send: vi.fn() } as unknown as Response;
		vi.mocked(response.status).mockReturnValue(response);

		await controller.showEditJobRoleForm(request, response);

		expect(response.render).toHaveBeenCalledWith(
			"job-role-form.njk",
			expect.objectContaining({
				mode: "edit",
				jobRoleId: 5,
				formValues: expect.objectContaining({ roleName: "QA Engineer" }),
			}),
		);
	});

	it("returns 404 when editing a job role that does not exist", async () => {
		const controller = new JobRoleController({
			getJobRoleById: vi.fn().mockResolvedValue(null),
			getReferenceOptions: vi.fn().mockResolvedValue({
				capabilities: [],
				bands: [],
			}),
			getFilterOptions: vi
				.fn()
				.mockResolvedValue({ capabilities: [], bands: [], statuses: [] }),
		} as unknown as JobRoleService);
		const request = {
			params: { id: "999" },
			session: {},
		} as unknown as Request<{ id: string }>;
		const response = createResponse();

		await controller.showEditJobRoleForm(request, response);

		expect(response.status).toHaveBeenCalledWith(404);
		expect(response.send).toHaveBeenCalledWith("Job role not found");
	});

	it("updates a job role and redirects to its detail page", async () => {
		const updateJobRole = vi
			.fn()
			.mockResolvedValue({ jobRoleId: 5, roleName: "QA Engineer" });
		const controller = new JobRoleController({
			updateJobRole,
		} as unknown as JobRoleService);
		const session: { jwtToken?: string; flashSuccess?: string } = {};
		const request = {
			params: { id: "5" },
			body: {
				roleName: "QA Engineer",
				location: "Remote",
				capabilityId: "1",
				bandId: "2",
				closingDate: "2027-10-10",
				status: "Closed",
			},
			session,
		} as unknown as Request<{ id: string }>;
		const response = { redirect: vi.fn() } as unknown as Response;

		await controller.updateJobRole(request, response);

		expect(updateJobRole).toHaveBeenCalledWith(
			5,
			{
				roleName: "QA Engineer",
				location: "Remote",
				capabilityId: 1,
				bandId: 2,
				closingDate: "2027-10-10",
				status: "Closed",
			},
			undefined,
		);
		expect(response.redirect).toHaveBeenCalledWith("/job-roles/5");
		expect(session.flashSuccess).toBe("QA Engineer was updated.");
	});

	it("re-renders the edit form when status is missing", async () => {
		const updateJobRole = vi.fn();
		const controller = new JobRoleController({
			updateJobRole,
			getReferenceOptions: vi.fn().mockResolvedValue({
				capabilities: [],
				bands: [],
			}),
			getFilterOptions: vi
				.fn()
				.mockResolvedValue({ capabilities: [], bands: [], statuses: [] }),
		} as unknown as JobRoleService);
		const request = {
			params: { id: "5" },
			body: {
				roleName: "QA Engineer",
				location: "Remote",
				capabilityId: "1",
				bandId: "2",
				closingDate: "2027-10-10",
			},
			session: {},
		} as unknown as Request<{ id: string }>;
		const response = createResponse();

		await controller.updateJobRole(request, response);

		expect(updateJobRole).not.toHaveBeenCalled();
		expect(response.status).toHaveBeenCalledWith(400);
	});
});

describe("JobRoleController delete job role", () => {
	it("deletes a job role and redirects to the list with a success message", async () => {
		const deleteJobRole = vi.fn().mockResolvedValue(undefined);
		const controller = new JobRoleController({
			deleteJobRole,
		} as unknown as JobRoleService);
		const session: { flashSuccess?: string } = {};
		const request = {
			params: { id: "5" },
			session,
		} as unknown as Request<{ id: string }>;
		const response = { redirect: vi.fn() } as unknown as Response;

		await controller.deleteJobRole(request, response);

		expect(deleteJobRole).toHaveBeenCalledWith(5, undefined);
		expect(response.redirect).toHaveBeenCalledWith("/job-roles");
		expect(session.flashSuccess).toBe("Job role deleted.");
	});

	it("redirects back to the role with a flash error when deletion conflicts", async () => {
		const deleteJobRole = vi
			.fn()
			.mockRejectedValue(
				axiosError("Cannot delete a job role with existing applications"),
			);
		const controller = new JobRoleController({
			deleteJobRole,
		} as unknown as JobRoleService);
		const session: { flashError?: string } = {};
		const request = {
			params: { id: "5" },
			session,
		} as unknown as Request<{ id: string }>;
		const response = { redirect: vi.fn() } as unknown as Response;
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		await controller.deleteJobRole(request, response);

		expect(response.redirect).toHaveBeenCalledWith("/job-roles/5");
		expect(session.flashError).toBe(
			"Cannot delete a job role with existing applications",
		);
		consoleError.mockRestore();
	});
});
