import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientMock = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("../src/config/apiClient", () => ({ default: apiClientMock }));

import { AnalyticsService } from "../src/services/AnalyticsService";
import type { AnalyticsTableQuery } from "../src/types/analytics";

const tableQuery = (
	overrides: Partial<AnalyticsTableQuery> = {},
): AnalyticsTableQuery => ({
	preset: "30d",
	from: undefined,
	to: undefined,
	page: 1,
	pageSize: 10,
	sortBy: "applications",
	sortOrder: "desc",
	capability: [],
	band: [],
	status: [],
	location: undefined,
	roleName: undefined,
	...overrides,
});

describe("AnalyticsService", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("requests the overview with the range parameters and bearer token", async () => {
		const overview = { range: { preset: "7d" } };
		apiClientMock.get.mockResolvedValue({ data: overview });

		const result = await new AnalyticsService().getOverview(
			{ preset: "7d" },
			"session-token",
		);

		expect(apiClientMock.get).toHaveBeenCalledWith("/analytics/overview", {
			params: { preset: "7d", from: undefined, to: undefined },
			headers: { Authorization: "Bearer session-token" },
		});
		expect(result).toEqual(overview);
	});

	it("omits the authorization header when there is no token", async () => {
		apiClientMock.get.mockResolvedValue({ data: {} });

		await new AnalyticsService().getOverview({ preset: "30d" });

		expect(apiClientMock.get).toHaveBeenCalledWith("/analytics/overview", {
			params: { preset: "30d", from: undefined, to: undefined },
			headers: undefined,
		});
	});

	it("sends a custom range through unchanged", async () => {
		apiClientMock.get.mockResolvedValue({ data: {} });

		await new AnalyticsService().getOverview(
			{ preset: "custom", from: "2026-01-01", to: "2026-01-31" },
			"session-token",
		);

		expect(apiClientMock.get).toHaveBeenCalledWith("/analytics/overview", {
			params: { preset: "custom", from: "2026-01-01", to: "2026-01-31" },
			headers: { Authorization: "Bearer session-token" },
		});
	});

	it("requests the job role table with repeated array parameters", async () => {
		const page = {
			items: [],
			page: 2,
			pageSize: 10,
			totalItems: 0,
			totalPages: 0,
		};
		apiClientMock.get.mockResolvedValue({ data: page });

		const result = await new AnalyticsService().getJobRoles(
			tableQuery({
				page: 2,
				sortBy: "roleName",
				sortOrder: "asc",
				capability: ["Engineering", "Data"],
				roleName: "engineer",
			}),
			"session-token",
		);

		expect(apiClientMock.get).toHaveBeenCalledWith("/analytics/job-roles", {
			params: {
				preset: "30d",
				from: undefined,
				to: undefined,
				page: 2,
				pageSize: 10,
				sortBy: "roleName",
				sortOrder: "asc",
				capability: ["Engineering", "Data"],
				band: [],
				status: [],
				location: undefined,
				roleName: "engineer",
			},
			paramsSerializer: { indexes: null },
			headers: { Authorization: "Bearer session-token" },
		});
		expect(result).toEqual(page);
	});

	it("propagates API failures to the caller", async () => {
		apiClientMock.get.mockRejectedValue(new Error("Request failed"));

		await expect(
			new AnalyticsService().getOverview({ preset: "7d" }, "session-token"),
		).rejects.toThrow("Request failed");
	});
});
