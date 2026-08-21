import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientMock = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("../src/config/apiClient", () => ({ default: apiClientMock }));

import { JobRoleService } from "../src/services/JobRoleService";

describe("JobRoleService filters", () => {
	beforeEach(() => vi.resetAllMocks());

	it("sends filters to the API using repeated array parameters", async () => {
		apiClientMock.get.mockResolvedValue({
			data: {
				items: [],
				page: 1,
				pageSize: 10,
				totalItems: 0,
				totalPages: 0,
			},
		});
		const filters = {
			roleName: "engineer",
			location: "Belfast",
			capability: ["Data", "Engineering"],
			band: ["Band 2"],
			status: ["Open"],
			closingDate: "2027-12-31",
		};

		await new JobRoleService().getAllJobRoles(1, 10, filters);

		expect(apiClientMock.get).toHaveBeenCalledWith("/job-roles", {
			params: { page: 1, pageSize: 10, ...filters },
			paramsSerializer: { indexes: null },
		});
	});

	it("returns the available filter options", async () => {
		const filterOptions = {
			capabilities: ["Engineering"],
			bands: ["Band 2"],
			statuses: ["Open"],
		};
		apiClientMock.get.mockResolvedValue({ data: filterOptions });

		const result = await new JobRoleService().getFilterOptions();

		expect(apiClientMock.get).toHaveBeenCalledWith("/job-roles/filter-options");
		expect(result).toEqual(filterOptions);
	});
});

describe("JobRoleService job role details", () => {
	beforeEach(() => vi.resetAllMocks());

	it("returns a job role from its detail endpoint", async () => {
		const jobRole = { jobRoleId: 12, roleName: "Software Engineer" };
		apiClientMock.get.mockResolvedValue({ data: jobRole });

		const result = await new JobRoleService().getJobRoleInformation(12);

		expect(apiClientMock.get).toHaveBeenCalledWith("/job-roles/12");
		expect(result).toEqual(jobRole);
	});

	it("finds the job role in the list when the detail endpoint fails", async () => {
		const jobRole = { jobRoleId: 12, roleName: "Software Engineer" };
		apiClientMock.get
			.mockRejectedValueOnce(new Error("Detail endpoint unavailable"))
			.mockResolvedValueOnce({
				data: {
					items: [jobRole],
					page: 1,
					pageSize: 10,
					totalItems: 1,
					totalPages: 1,
				},
			});

		const result = await new JobRoleService().getJobRoleInformation(12);

		expect(apiClientMock.get).toHaveBeenNthCalledWith(2, "/job-roles", {
			params: {
				page: 1,
				pageSize: 10,
				capability: [],
				band: [],
				status: [],
			},
			paramsSerializer: { indexes: null },
		});
		expect(result).toEqual(jobRole);
	});

	it("returns null when the fallback list does not contain the job role", async () => {
		apiClientMock.get
			.mockRejectedValueOnce(new Error("Detail endpoint unavailable"))
			.mockResolvedValueOnce({
				data: {
					items: [],
					page: 1,
					pageSize: 10,
					totalItems: 0,
					totalPages: 0,
				},
			});

		const result = await new JobRoleService().getJobRoleInformation(99);

		expect(result).toBeNull();
	});

	it("gets a job role by id through the shared lookup", async () => {
		const service = new JobRoleService();
		const jobRole = { jobRoleId: 12, roleName: "Software Engineer" };
		const getJobRoleInformation = vi
			.spyOn(service, "getJobRoleInformation")
			.mockResolvedValue(jobRole as never);

		const result = await service.getJobRoleById(12);

		expect(getJobRoleInformation).toHaveBeenCalledWith(12);
		expect(result).toEqual(jobRole);
	});
});
