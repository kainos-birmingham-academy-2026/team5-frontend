import { join } from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(join(process.cwd(), "src", "views")),
	{ autoescape: true },
);

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
		rolesPastClosingDateStillOpen: 2,
	},
	trend: [{ bucketStart: "2026-09-17", count: 4 }],
	breakdowns: {
		byCapability: [{ label: "Engineering", count: 4, percentage: 100 }],
		byBand: [{ label: "Band 2", count: 4, percentage: 100 }],
		byLocation: [{ label: "Belfast", count: 4, percentage: 100 }],
		byRoleStatus: [{ label: "Open", count: 2, percentage: 100 }],
		demandVsSupply: [
			{ label: "Engineering", openPositions: 2, applications: 4 },
		],
	},
	topRoles: [
		{
			jobRoleId: 1,
			roleName: "Platform Engineer",
			capability: "Engineering",
			band: "Band 2",
			location: "Belfast",
			closingDate: "2026-09-20",
			numberOfOpenPositions: 2,
			applications: 4,
			applicationsPerPosition: 2,
			daysUntilClosing: 3,
		},
	],
	coldRoles: [
		{
			jobRoleId: 2,
			roleName: "<script>Data Analyst</script>",
			capability: "Data",
			band: "Band 3",
			location: "London",
			closingDate: "2026-09-12",
			numberOfOpenPositions: 1,
			applications: 0,
			applicationsPerPosition: 0,
			daysUntilClosing: -5,
		},
	],
	dataQuality: { cvScanStatus: [{ label: "pending", count: 4 }] },
};

const model = {
	isAdmin: true,
	isAuthenticated: true,
	query: {
		preset: "7d",
		from: undefined,
		to: undefined,
		page: 1,
		pageSize: 10,
		sortBy: "applications",
		sortOrder: "desc",
		capability: ["Engineering"],
		band: [],
		status: [],
		location: undefined,
		roleName: undefined,
	},
	overview,
	table: {
		items: overview.topRoles,
		page: 1,
		pageSize: 10,
		totalItems: 1,
		totalPages: 1,
	},
	sortLinks: {
		applications: {
			href: "/admin/analytics?sortOrder=asc",
			ariaSort: "descending",
		},
		roleName: { href: "/admin/analytics?sortBy=roleName", ariaSort: "none" },
		closingDate: {
			href: "/admin/analytics?sortBy=closingDate",
			ariaSort: "none",
		},
		numberOfOpenPositions: {
			href: "/admin/analytics?sortBy=numberOfOpenPositions",
			ariaSort: "none",
		},
	},
	pageLinks: {},
	volumeChart: {
		width: 760,
		height: 260,
		baseline: 216,
		max: 4,
		points: [
			{
				bucketStart: "2026-09-17",
				count: 4,
				x: 394,
				y: 16,
				showLabel: true,
			},
		],
		showMarkers: true,
		plotLeft: 44,
		plotRight: 744,
		tickLabelX: 36,
		axisLabelY: 236,
		line: "394,16",
		area: "M394,216 L394,16 L394,216 Z",
		ticks: [
			{ value: 0, y: 216 },
			{ value: 1, y: 166 },
			{ value: 2, y: 116 },
			{ value: 3, y: 66 },
			{ value: 4, y: 16 },
		],
	},
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
	roleStatusDonut: {
		total: 2,
		radius: 56,
		segments: [
			{
				label: "Open",
				count: 2,
				percentage: 100,
				dashArray: "351.9 0",
				dashOffset: 0,
				series: 1,
			},
		],
	},
	topRolesChart: [
		{
			jobRoleId: 1,
			roleName: "Platform Engineer",
			applications: 4,
			width: 100,
		},
	],
	demandVsSupply: [
		{
			label: "Engineering",
			openPositions: 2,
			applications: 4,
			openPositionsWidth: 50,
			applicationsWidth: 100,
		},
	],
};

const render = (context: Record<string, unknown>) =>
	environment.render("admin-analytics.njk", context);

describe("admin-analytics.njk", () => {
	it("renders every panel for a populated overview", () => {
		const html = render(model);

		expect(html).toContain("Application analytics");
		expect(html).toContain("Application volume over time");
		expect(html).toContain("Applications by job role");
		expect(html).toContain("Share of applications by capability");
		expect(html).toContain("Share of job roles by status");
		expect(html).toContain("Applications by capability");
		expect(html).toContain("Applications by band");
		expect(html).toContain("Applications by location");
		expect(html).toContain("Roles by status");
		expect(html).toContain("Demand versus supply by capability");
		expect(html).toContain("Top performing roles");
		expect(html).toContain("Cold vacancies");
		expect(html).toContain("All roles");
		expect(html).toContain("CV scan status");
	});

	it("works without JavaScript by using a GET form and query-string links", () => {
		const html = render(model);

		expect(html).toContain('method="get" action="/admin/analytics"');
		expect(html).toContain('name="preset"');
		expect(html).toContain('<option value="7d" selected>');
		expect(html).toContain('href="/admin/analytics?sortBy=roleName"');
	});

	it("does not offer capability, band or status filter controls", () => {
		const html = render(model);

		expect(html).not.toContain('name="capability"');
		expect(html).not.toContain('name="band"');
		expect(html).not.toContain('name="status"');
	});

	it("sizes bars with inline percentages and always shows the numeric value", () => {
		const html = render(model);

		expect(html).toContain('style="width: 100%"');
		expect(html).toContain("<td>4</td>");
	});

	it("draws the application volume chart as scalable SVG with axis gridlines", () => {
		const html = render(model);

		expect(html).toContain('viewBox="0 0 760 260"');
		expect(html).toContain(
			'<polyline class="analytics-chart-line" points="394,16" />',
		);
		expect(html).toContain('<path class="analytics-chart-area"');
		expect(html).toContain('x1="44" y1="216" x2="744" y2="216"');
	});

	it("draws donut charts with a tabular legend beside them", () => {
		const html = render(model);

		expect(html).toContain(
			'class="analytics-donut-segment analytics-series-1"',
		);
		expect(html).toContain('stroke-dasharray="351.9 0"');
		expect(html).toContain("<td>100%</td>");
	});

	it("gives the trend an accessible name and a tabular fallback", () => {
		const html = render(model);

		expect(html).toContain('role="img"');
		expect(html).toContain("applications received per day");
		expect(html).toContain("View the trend as a table");
	});

	it("surfaces the data model limitations next to the metrics they affect", () => {
		const html = render(model);

		expect(html).toContain("Job roles have no created date");
		expect(html).toContain("Closing dates are stored as text");
		expect(html).toContain("is never updated");
	});

	it("marks the past closing date alert as a warning", () => {
		const html = render(model);

		expect(html).toContain("analytics-kpi analytics-kpi-warning");
	});

	it("escapes values returned by the API", () => {
		const html = render(model);

		expect(html).not.toContain("<script>Data Analyst</script>");
		expect(html).toContain("&lt;script&gt;Data Analyst&lt;/script&gt;");
	});

	it("shows a validation message instead of the dashboard for an invalid range", () => {
		const html = render({
			...model,
			overview: null,
			table: null,
			volumeChart: null,
			capabilityDonut: null,
			roleStatusDonut: null,
			topRolesChart: [],
			demandVsSupply: [],
			validationMessage: "from must not be later than to",
		});

		expect(html).toContain("from must not be later than to");
		expect(html).toContain(
			"Adjust the date range above to load the dashboard.",
		);
		expect(html).not.toContain("Top performing roles");
	});

	it("shows an empty state for each panel when nothing was received", () => {
		const html = render({
			...model,
			overview: {
				...overview,
				trend: [],
				breakdowns: {
					byCapability: [],
					byBand: [],
					byLocation: [],
					byRoleStatus: [],
					demandVsSupply: [],
				},
				topRoles: [],
				coldRoles: [],
				dataQuality: { cvScanStatus: [] },
			},
			volumeChart: null,
			capabilityDonut: null,
			roleStatusDonut: null,
			topRolesChart: [],
			demandVsSupply: [],
			table: { items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
		});

		expect(html).toContain("No applications were received in this period.");
		expect(html).toContain("No job roles match the selected filters.");
		expect(html).toContain("No CVs were uploaded in this period.");
		expect(html).toContain(
			"Every open role received at least one application in this period.",
		);
	});
});
