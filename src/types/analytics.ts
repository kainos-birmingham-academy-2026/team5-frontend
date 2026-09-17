export type AnalyticsPreset = "7d" | "30d" | "90d" | "custom";

export type AnalyticsRange = {
	from: string;
	to: string;
	preset: string;
	granularity: "day" | "week";
};

export type AnalyticsKpis = {
	totalApplications: number;
	previousPeriodApplications: number;
	applicationsChangePercent: number;
	totalJobRoles: number;
	openRoles: number;
	closedRoles: number;
	totalOpenPositions: number;
	uniqueApplicants: number;
	averageApplicationsPerOpenRole: number;
	applicationsPerOpenPosition: number;
	rolesWithNoApplications: number;
	rolesClosingWithin7Days: number;
	rolesPastClosingDateStillOpen: number;
};

export type AnalyticsTrendPoint = {
	bucketStart: string;
	count: number;
};

export type AnalyticsBreakdownItem = {
	label: string;
	count: number;
	percentage: number;
};

export type AnalyticsDemandVsSupplyItem = {
	label: string;
	openPositions: number;
	applications: number;
};

export type AnalyticsBreakdowns = {
	byCapability: AnalyticsBreakdownItem[];
	byBand: AnalyticsBreakdownItem[];
	byLocation: AnalyticsBreakdownItem[];
	byRoleStatus: AnalyticsBreakdownItem[];
	demandVsSupply: AnalyticsDemandVsSupplyItem[];
};

export type AnalyticsRoleSummary = {
	jobRoleId: number;
	roleName: string;
	capability: string;
	band: string;
	location: string;
	closingDate: string;
	numberOfOpenPositions: number;
	applications: number;
	applicationsPerPosition: number;
	daysUntilClosing: number;
};

export type AnalyticsDataQualityItem = {
	label: string;
	count: number;
};

export type AnalyticsOverview = {
	range: AnalyticsRange;
	kpis: AnalyticsKpis;
	trend: AnalyticsTrendPoint[];
	breakdowns: AnalyticsBreakdowns;
	topRoles: AnalyticsRoleSummary[];
	coldRoles: AnalyticsRoleSummary[];
	dataQuality: { cvScanStatus: AnalyticsDataQualityItem[] };
};

export type PaginatedAnalyticsJobRoles = {
	items: AnalyticsRoleSummary[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export type AnalyticsRangeQuery = {
	preset: AnalyticsPreset;
	from?: string;
	to?: string;
};

export type AnalyticsTableQuery = AnalyticsRangeQuery & {
	page: number;
	pageSize: number;
	sortBy: "applications" | "roleName" | "closingDate" | "numberOfOpenPositions";
	sortOrder: "asc" | "desc";
	capability: string[];
	band: string[];
	status: string[];
	location?: string;
	roleName?: string;
};
