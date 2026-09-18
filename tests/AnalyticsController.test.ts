import { AxiosError, AxiosHeaders } from "axios";
import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loggerMock = vi.hoisted(() => ({ error: vi.fn(), info: vi.fn() }));

vi.mock("../src/lib/logger", () => ({ default: loggerMock }));

import {
	AnalyticsController,
	buildAnalyticsUrl,
	parseAnalyticsQuery,
} from "../src/controllers/AnalyticsController";
import type { AnalyticsService } from "../src/services/AnalyticsService";

const apiError = (status: number, data?: unknown): AxiosError => {
	const error = new AxiosError("Request failed");
	error.response = {
		status,
		statusText: "",
		data,
		headers: new AxiosHeaders(),
		config: { headers: new AxiosHeaders() },
	};
	return error;
};

const overview = {
	range: {
		from: "2026-09-11",
		to: "2026-09-17",
		preset: "7d",
		granularity: "day",
	},
	kpis: {
		totalApplications: 4,
		previousPeriodApplications: 2,
		applicationsChangePercent: 100,
		totalJobRoles: 2,
		openRoles: 2,
		closedRoles: 0,
		totalOpenPositions: 3,
		uniqueApplicants: 4,
		averageApplicationsPerOpenRole: 2,
		applicationsPerOpenPosition: 1.3,
		rolesWithNoApplications: 1,
		rolesClosingWithin7Days: 1,
		rolesPastClosingDateStillOpen: 0,
	},
	trend: [
		{ bucketStart: "2026-09-16", count: 1 },
		{ bucketStart: "2026-09-17", count: 3 },
	],
	breakdowns: {
		byCapability: [{ label: "Engineering", count: 4, percentage: 100 }],
		byBand: [{ label: "Band 2", count: 4, percentage: 100 }],
		byLocation: [{ label: "Belfast", count: 4, percentage: 100 }],
		byRoleStatus: [{ label: "Open", count: 2, percentage: 100 }],
		demandVsSupply: [
			{ label: "Engineering", openPositions: 2, applications: 4 },
		],
	},
	topRoles: [],
	coldRoles: [],
	dataQuality: { cvScanStatus: [{ label: "pending", count: 4 }] },
};

const table = {
	items: [],
	page: 2,
	pageSize: 10,
	totalItems: 25,
	totalPages: 3,
};

const createResponse = () => {
	const res = {
		render: vi.fn(),
		redirect: vi.fn(),
		send: vi.fn(),
		status: vi.fn().mockReturnThis(),
	};
	return res as unknown as Response & typeof res;
};

const createRequest = (query: Record<string, unknown> = {}) =>
	({
		query,
		originalUrl: "/admin/analytics",
		session: { jwtToken: "session-token" },
	}) as unknown as Request;

describe("parseAnalyticsQuery", () => {
	it("applies defaults for an empty query string", () => {
		expect(parseAnalyticsQuery({})).toEqual({
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
		});
	});

	it("falls back to the default preset and sort for unknown values", () => {
		const parsed = parseAnalyticsQuery({
			preset: "12d",
			sortBy: "applicantId",
		});

		expect(parsed.preset).toBe("30d");
		expect(parsed.sortBy).toBe("applications");
	});

	it("normalises single filter values into arrays and ignores a bad page", () => {
		const parsed = parseAnalyticsQuery({
			capability: "Engineering",
			page: "0",
		});

		expect(parsed.capability).toEqual(["Engineering"]);
		expect(parsed.page).toBe(1);
	});
});

describe("buildAnalyticsUrl", () => {
	it("keeps every piece of state in the query string", () => {
		const url = buildAnalyticsUrl({
			preset: "custom",
			from: "2026-01-01",
			to: "2026-01-31",
			page: 3,
			pageSize: 10,
			sortBy: "roleName",
			sortOrder: "asc",
			capability: ["Engineering", "Data"],
			band: [],
			status: ["Open"],
			location: "Belfast",
			roleName: "engineer",
		});

		expect(url).toBe(
			"/admin/analytics?preset=custom&from=2026-01-01&to=2026-01-31&sortBy=roleName&sortOrder=asc&page=3&capability=Engineering&capability=Data&status=Open&location=Belfast&roleName=engineer",
		);
	});

	it("omits the first page from the query string", () => {
		expect(
			buildAnalyticsUrl({
				preset: "7d",
				page: 1,
				pageSize: 10,
				sortBy: "applications",
				sortOrder: "desc",
				capability: [],
				band: [],
				status: [],
			}),
		).toBe("/admin/analytics?preset=7d&sortBy=applications&sortOrder=desc");
	});
});

describe("AnalyticsController", () => {
	const serviceMock = {
		getOverview: vi.fn(),
		getJobRoles: vi.fn(),
	};
	const controller = new AnalyticsController(
		serviceMock as unknown as AnalyticsService,
	);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the dashboard with pre-computed chart geometry", async () => {
		serviceMock.getOverview.mockResolvedValue(overview);
		serviceMock.getJobRoles.mockResolvedValue(table);
		const res = createResponse();

		await controller.getDashboard(createRequest({ preset: "7d" }), res);

		expect(serviceMock.getOverview).toHaveBeenCalledWith(
			expect.objectContaining({ preset: "7d" }),
			"session-token",
		);
		expect(res.render).toHaveBeenCalledWith(
			"admin-analytics.njk",
			expect.objectContaining({
				overview,
				table,
				volumeChart: expect.objectContaining({
					max: 4,
					line: "44,166 744,66",
					points: [
						expect.objectContaining({
							bucketStart: "2026-09-16",
							count: 1,
							x: 44,
							y: 166,
						}),
						expect.objectContaining({
							bucketStart: "2026-09-17",
							count: 3,
							x: 744,
							y: 66,
						}),
					],
				}),
				capabilityDonut: {
					total: 4,
					radius: 56,
					segments: [
						{
							label: "Engineering",
							count: 4,
							percentage: 100,
							dashArray: "351.9 0",
							dashOffset: 0,
							series: 1,
						},
					],
				},
				topRolesChart: [],
				demandVsSupply: [
					{
						label: "Engineering",
						openPositions: 2,
						applications: 4,
						openPositionsWidth: 50,
						applicationsWidth: 100,
					},
				],
			}),
		);
	});

	it("builds previous and next page links from the table response", async () => {
		serviceMock.getOverview.mockResolvedValue(overview);
		serviceMock.getJobRoles.mockResolvedValue(table);
		const res = createResponse();

		await controller.getDashboard(
			createRequest({ preset: "7d", page: "2" }),
			res,
		);

		const model = res.render.mock.calls[0]?.[1];
		expect(model.pageLinks.previous).toContain("sortOrder=desc");
		expect(model.pageLinks.next).toContain("page=3");
	});

	it("marks the active sort column and flips its direction", async () => {
		serviceMock.getOverview.mockResolvedValue(overview);
		serviceMock.getJobRoles.mockResolvedValue(table);
		const res = createResponse();

		await controller.getDashboard(createRequest({ preset: "7d" }), res);

		const model = res.render.mock.calls[0]?.[1];
		expect(model.sortLinks.applications.ariaSort).toBe("descending");
		expect(model.sortLinks.applications.href).toContain("sortOrder=asc");
		expect(model.sortLinks.roleName.ariaSort).toBe("none");
	});

	it("redirects to the login page when the API rejects the token", async () => {
		serviceMock.getOverview.mockRejectedValue(apiError(401));
		serviceMock.getJobRoles.mockRejectedValue(apiError(401));
		const req = createRequest();
		const res = createResponse();

		await controller.getDashboard(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/login");
		expect(req.session.returnTo).toBe("/admin/analytics");
	});

	it("returns a forbidden response when the API rejects the role", async () => {
		serviceMock.getOverview.mockRejectedValue(apiError(403));
		serviceMock.getJobRoles.mockRejectedValue(apiError(403));
		const res = createResponse();

		await controller.getDashboard(createRequest(), res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.send).toHaveBeenCalledWith("Forbidden");
	});

	it("renders a validation message instead of an error page for an invalid range", async () => {
		serviceMock.getOverview.mockRejectedValue(
			apiError(400, {
				error: "Invalid analytics query",
				details: [{ message: "from must not be later than to" }],
			}),
		);
		serviceMock.getJobRoles.mockRejectedValue(apiError(400));
		const res = createResponse();

		await controller.getDashboard(
			createRequest({ preset: "custom", from: "2026-03-01", to: "2026-02-01" }),
			res,
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.render).toHaveBeenCalledWith(
			"admin-analytics.njk",
			expect.objectContaining({
				validationMessage: "from must not be later than to",
				overview: null,
			}),
		);
	});

	it("renders a friendly error page and logs any other failure", async () => {
		serviceMock.getOverview.mockRejectedValue(new Error("connection refused"));
		serviceMock.getJobRoles.mockRejectedValue(new Error("connection refused"));
		const res = createResponse();

		await controller.getDashboard(createRequest(), res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith(
			"error.njk",
			expect.objectContaining({
				heading: "We could not load the analytics dashboard",
			}),
		);
		expect(loggerMock.error).toHaveBeenCalledWith(
			"Failed to load the analytics dashboard: connection refused",
		);
	});
});
