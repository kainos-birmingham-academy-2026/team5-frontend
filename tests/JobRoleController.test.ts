import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../src/controllers/JobRoleController";
import type { JobRoleService } from "../src/services/JobRoleService";

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
		expect(getAllJobRoles).toHaveBeenCalledWith(2, 10, filters);
		expect(getFilterOptions).toHaveBeenCalledOnce();
		expect(res.render).toHaveBeenCalledWith("job-role-list.njk", {
			jobRoles: [],
			pagination: expect.objectContaining({ page: 2 }),
			filters,
			filterOptions,
			filterQuery:
				"roleName=engineer&location=Belfast&capability=Data&capability=Engineering&band=Band+2&status=Open&closingDate=2027-12-31",
		});
	});
});

describe("JobRoleController home page", () => {
	it("passes and consumes the registration success message", async () => {
		const getAllJobRoles = vi.fn().mockResolvedValue({ items: [] });
		const controller = new JobRoleController({
			getAllJobRoles,
		} as unknown as JobRoleService);
		const req = {
			session: {
				registrationSuccessMessage: "Account successfully created.",
			},
		} as unknown as Request;
		const res = { render: vi.fn() } as unknown as Response;

		await controller.getHomePage(req, res);

		expect(res.render).toHaveBeenCalledWith("careers-home.njk", {
			featuredRoles: [],
			registrationSuccessMessage: "Account successfully created.",
		});
		expect(req.session.registrationSuccessMessage).toBeUndefined();
	});
});
