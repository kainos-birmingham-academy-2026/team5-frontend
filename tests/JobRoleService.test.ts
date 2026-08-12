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
});
