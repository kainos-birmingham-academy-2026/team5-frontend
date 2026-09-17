import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientMock = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

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

		await new JobRoleService().getAllJobRoles(1, 10, filters, "session-token");

		expect(apiClientMock.get).toHaveBeenCalledWith("/job-roles", {
			params: { page: 1, pageSize: 10, ...filters },
			paramsSerializer: { indexes: null },
			headers: { Authorization: "Bearer session-token" },
		});
	});

	it("returns the available filter options", async () => {
		const filterOptions = {
			capabilities: ["Engineering"],
			bands: ["Band 2"],
			statuses: ["Open"],
		};
		apiClientMock.get.mockResolvedValue({ data: filterOptions });

		const result = await new JobRoleService().getFilterOptions("session-token");

		expect(apiClientMock.get).toHaveBeenCalledWith(
			"/job-roles/filter-options",
			{
				headers: { Authorization: "Bearer session-token" },
			},
		);
		expect(result).toEqual(filterOptions);
	});
});

describe("JobRoleService job role details", () => {
	beforeEach(() => vi.resetAllMocks());

	it("returns a job role from its detail endpoint", async () => {
		const jobRole = { jobRoleId: 12, roleName: "Software Engineer" };
		apiClientMock.get.mockResolvedValue({ data: jobRole });

		const result = await new JobRoleService().getJobRoleInformation(
			12,
			"session-token",
		);

		expect(apiClientMock.get).toHaveBeenCalledWith("/job-roles/12", {
			headers: { Authorization: "Bearer session-token" },
		});
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
			headers: undefined,
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

		expect(getJobRoleInformation).toHaveBeenCalledWith(12, undefined);
		expect(result).toEqual(jobRole);
	});
});

describe("JobRoleService application eligibility", () => {
	it.each([
		["open role with vacancies", "Open", 1, true],
		["closed role with vacancies", "Closed", 1, false],
		["open role without vacancies", "Open", 0, false],
	] as const)("returns %s as eligible=%s", (_description, status, vacancies, expected) => {
		const eligible = new JobRoleService().canApplyToJobRole({
			jobRoleId: 12,
			roleName: "Software Engineer",
			location: "Belfast",
			capabilityId: 1,
			bandId: 1,
			closingDate: new Date(),
			status,
			numberOfOpenPositions: vacancies,
		});

		expect(eligible).toBe(expected);
	});
});

describe("JobRoleService CV uploads", () => {
	beforeEach(() => vi.resetAllMocks());

	it("lets Axios set the multipart Content-Type boundary", async () => {
		apiClientMock.post.mockResolvedValue({ data: { applicationId: 7 } });

		await new JobRoleService().submitJobApplication(
			12,
			{
				originalname: "cv.pdf",
				mimetype: "application/pdf",
				buffer: Buffer.from("pdf-data"),
			},
			"session-token",
		);

		expect(apiClientMock.post).toHaveBeenCalledWith(
			"/job-roles/12/applications",
			expect.any(FormData),
			{
				headers: { Authorization: "Bearer session-token" },
				timeout: 30000,
			},
		);
	});
});
