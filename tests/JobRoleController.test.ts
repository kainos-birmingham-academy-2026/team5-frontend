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
		const request = { params: { id: "12" }, session: {} } as unknown as Request<{
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
		const request = { params: { id: "99" }, session: {} } as unknown as Request<{
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
		const request = { params: { id: "12" }, session: {} } as unknown as Request<{
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
