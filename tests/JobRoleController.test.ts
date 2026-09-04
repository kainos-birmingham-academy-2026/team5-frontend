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
		expect(getAllJobRoles).toHaveBeenCalledWith(2, 10, filters, {});
		expect(getFilterOptions).toHaveBeenCalledOnce();
		expect(res.render).toHaveBeenCalledWith(
			"job-role-list.njk",
			expect.objectContaining({
				jobRoles: [],
				pagination: expect.objectContaining({ page: 2 }),
				filters,
				filterOptions,
				filterQuery:
					"roleName=engineer&location=Belfast&capability=Data&capability=Engineering&band=Band+2&status=Open&closingDate=2027-12-31",
				paginationQuery:
					"roleName=engineer&location=Belfast&capability=Data&capability=Engineering&band=Band+2&status=Open&closingDate=2027-12-31",
			}),
		);
	});

	it("returns a server error when job roles cannot be retrieved", async () => {
		const getAllJobRoles = vi
			.fn()
			.mockRejectedValue(new Error("API unavailable"));
		const controller = new JobRoleController({
			getAllJobRoles,
			getFilterOptions: vi.fn(),
		} as unknown as JobRoleService);
		const request = { query: {} } as unknown as Request;
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

describe("JobRoleController sorting", () => {
	const renderSorted = async (query: Record<string, string>) => {
		const getAllJobRoles = vi.fn().mockResolvedValue({
			items: [],
			page: 1,
			pageSize: 10,
			totalItems: 0,
			totalPages: 0,
		});
		const controller = new JobRoleController({
			getAllJobRoles,
			getFilterOptions: vi.fn().mockResolvedValue({
				capabilities: [],
				bands: [],
				statuses: [],
			}),
		} as unknown as JobRoleService);
		const res = { render: vi.fn() } as unknown as Response;

		await controller.getAllJobRoles({ query } as unknown as Request, res);

		return {
			getAllJobRoles,
			view: vi.mocked(res.render).mock.calls[0][1] as Record<string, unknown>,
		};
	};

	const columnFor = (view: Record<string, unknown>, field: string) =>
		(
			view.sortColumns as {
				field: string;
				href: string;
				order?: string;
			}[]
		).find((column) => column.field === field);

	it("exposes a clickable link for every sortable column", async () => {
		const { view } = await renderSorted({});

		expect(view.sortColumns).toHaveLength(6);
		expect(
			(view.sortColumns as { field: string }[]).map((column) => column.field),
		).toEqual([
			"roleName",
			"location",
			"capability",
			"band",
			"closingDate",
			"status",
		]);
	});

	it("links an unsorted column to an ascending sort", async () => {
		const { view, getAllJobRoles } = await renderSorted({});

		expect(getAllJobRoles).toHaveBeenCalledWith(1, 10, expect.anything(), {});
		expect(columnFor(view, "roleName")).toMatchObject({
			href: "/job-roles?sortBy=roleName&sortOrder=asc",
			order: undefined,
		});
	});

	it("links an ascending column to a descending sort", async () => {
		const { view, getAllJobRoles } = await renderSorted({
			sortBy: "roleName",
			sortOrder: "asc",
		});

		expect(getAllJobRoles).toHaveBeenCalledWith(1, 10, expect.anything(), {
			sortBy: "roleName",
			sortOrder: "asc",
		});
		expect(columnFor(view, "roleName")).toMatchObject({
			href: "/job-roles?sortBy=roleName&sortOrder=desc",
			order: "asc",
		});
	});

	it("links a descending column back to no ordering", async () => {
		const { view, getAllJobRoles } = await renderSorted({
			sortBy: "roleName",
			sortOrder: "desc",
		});

		expect(getAllJobRoles).toHaveBeenCalledWith(1, 10, expect.anything(), {
			sortBy: "roleName",
			sortOrder: "desc",
		});
		expect(columnFor(view, "roleName")).toMatchObject({
			href: "/job-roles",
			order: "desc",
			actionLabel: "Remove sorting by Role name",
		});
	});

	it("keeps active filters in the sort links and the sort in pagination links", async () => {
		const { view } = await renderSorted({
			location: "Belfast",
			sortBy: "band",
			sortOrder: "asc",
		});

		expect(columnFor(view, "capability")?.href).toBe(
			"/job-roles?location=Belfast&sortBy=capability&sortOrder=asc",
		);
		expect(view.paginationQuery).toBe(
			"location=Belfast&sortBy=band&sortOrder=asc",
		);
	});

	it("ignores an unknown sort column", async () => {
		const { view, getAllJobRoles } = await renderSorted({
			sortBy: "salary",
			sortOrder: "desc",
		});

		expect(getAllJobRoles).toHaveBeenCalledWith(1, 10, expect.anything(), {});
		expect(view.paginationQuery).toBe("");
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
		const request = { params: { id: "12" } } as unknown as Request<{
			id: string;
		}>;
		const response = createResponse();

		await controller.getJobRoleInformation(request, response);

		expect(getJobRoleById).toHaveBeenCalledWith(12);
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
		const request = { params: { id: "99" } } as unknown as Request<{
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
		const request = { params: { id: "12" } } as unknown as Request<{
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
