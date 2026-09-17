import axios from "axios";
import type { Request, Response } from "express";
import Logger from "../lib/logger";
import type { AnalyticsService } from "../services/AnalyticsService";
import type {
	AnalyticsOverview,
	AnalyticsPreset,
	AnalyticsTableQuery,
	PaginatedAnalyticsJobRoles,
} from "../types/analytics";

const PRESETS = new Set<AnalyticsPreset>(["7d", "30d", "90d", "custom"]);

const SORT_COLUMNS = [
	"applications",
	"roleName",
	"closingDate",
	"numberOfOpenPositions",
] as const;

type SortColumn = (typeof SORT_COLUMNS)[number];

const DEFAULT_PAGE_SIZE = 10;

const firstQueryValue = (value: unknown): string | undefined =>
	typeof value === "string" && value.trim() ? value.trim() : undefined;

const queryValues = (value: unknown): string[] =>
	(Array.isArray(value) ? value : [value]).filter(
		(item): item is string => typeof item === "string" && item.length > 0,
	);

const parsePreset = (value: unknown): AnalyticsPreset =>
	typeof value === "string" && PRESETS.has(value as AnalyticsPreset)
		? (value as AnalyticsPreset)
		: "30d";

const parseSortBy = (value: unknown): SortColumn =>
	typeof value === "string" && SORT_COLUMNS.includes(value as SortColumn)
		? (value as SortColumn)
		: "applications";

const parsePage = (value: unknown): number => {
	const page = Number(value ?? 1);
	return Number.isInteger(page) && page > 0 ? page : 1;
};

export const parseAnalyticsQuery = (
	query: Request["query"],
): AnalyticsTableQuery => ({
	preset: parsePreset(query.preset),
	from: firstQueryValue(query.from),
	to: firstQueryValue(query.to),
	page: parsePage(query.page),
	pageSize: DEFAULT_PAGE_SIZE,
	sortBy: parseSortBy(query.sortBy),
	sortOrder: query.sortOrder === "asc" ? "asc" : "desc",
	capability: queryValues(query.capability),
	band: queryValues(query.band),
	status: queryValues(query.status),
	location: firstQueryValue(query.location),
	roleName: firstQueryValue(query.roleName),
});

export const buildAnalyticsUrl = (query: AnalyticsTableQuery): string => {
	const params = new URLSearchParams();
	params.set("preset", query.preset);
	if (query.from) params.set("from", query.from);
	if (query.to) params.set("to", query.to);
	params.set("sortBy", query.sortBy);
	params.set("sortOrder", query.sortOrder);
	if (query.page > 1) params.set("page", String(query.page));
	for (const value of query.capability) params.append("capability", value);
	for (const value of query.band) params.append("band", value);
	for (const value of query.status) params.append("status", value);
	if (query.location) params.set("location", query.location);
	if (query.roleName) params.set("roleName", query.roleName);
	return `/admin/analytics?${params.toString()}`;
};

const buildSortLinks = (
	query: AnalyticsTableQuery,
): Record<SortColumn, { href: string; ariaSort: string }> => {
	const links = {} as Record<SortColumn, { href: string; ariaSort: string }>;

	for (const column of SORT_COLUMNS) {
		const isActive = query.sortBy === column;
		links[column] = {
			href: buildAnalyticsUrl({
				...query,
				page: 1,
				sortBy: column,
				sortOrder: isActive && query.sortOrder === "desc" ? "asc" : "desc",
			}),
			ariaSort: isActive
				? query.sortOrder === "asc"
					? "ascending"
					: "descending"
				: "none",
		};
	}

	return links;
};

const buildPageLinks = (
	query: AnalyticsTableQuery,
	table: PaginatedAnalyticsJobRoles | null,
): { previous?: string; next?: string } => {
	if (!table) {
		return {};
	}

	return {
		previous:
			table.page > 1
				? buildAnalyticsUrl({ ...query, page: table.page - 1 })
				: undefined,
		next:
			table.page < table.totalPages
				? buildAnalyticsUrl({ ...query, page: table.page + 1 })
				: undefined,
	};
};

const largest = (values: number[]): number =>
	values.reduce((max, value) => (value > max ? value : max), 0);

/** Bar sizes are pre-computed here so the template never does arithmetic. */
const percentOf = (value: number, max: number): number =>
	max > 0 ? Math.round((value / max) * 1000) / 10 : 0;

const validationMessageFrom = (error: unknown): string | undefined => {
	if (!axios.isAxiosError(error) || error.response?.status !== 400) {
		return undefined;
	}

	const body = error.response.data as
		| { error?: string; details?: { message?: string }[] }
		| undefined;
	const details = (body?.details ?? [])
		.map((issue) => issue.message)
		.filter((message): message is string => Boolean(message));

	return details.length
		? details.join(". ")
		: (body?.error ?? "The selected date range is not valid.");
};

export class AnalyticsController {
	constructor(private readonly analyticsService: AnalyticsService) {}

	async getDashboard(req: Request, res: Response): Promise<void> {
		const query = parseAnalyticsQuery(req.query);
		const jwtToken = req.session.jwtToken;

		try {
			const [overview, table] = await Promise.all([
				this.analyticsService.getOverview(query, jwtToken),
				this.analyticsService.getJobRoles(query, jwtToken),
			]);

			res.render("admin-analytics.njk", this.viewModel(query, overview, table));
		} catch (error) {
			const status = axios.isAxiosError(error)
				? error.response?.status
				: undefined;

			if (status === 401) {
				req.session.returnTo = req.originalUrl;
				res.redirect("/login");
				return;
			}

			if (status === 403) {
				res.status(403).send("Forbidden");
				return;
			}

			const validationMessage = validationMessageFrom(error);
			if (validationMessage) {
				res.status(200).render("admin-analytics.njk", {
					...this.viewModel(query, null, null),
					validationMessage,
				});
				return;
			}

			Logger.error(
				`Failed to load the analytics dashboard: ${
					error instanceof Error ? error.message : "unknown error"
				}`,
			);
			res.status(500).render("error.njk", {
				heading: "We could not load the analytics dashboard",
				message:
					"The analytics service is unavailable right now. Please try again shortly.",
			});
		}
	}

	private viewModel(
		query: AnalyticsTableQuery,
		overview: AnalyticsOverview | null,
		table: PaginatedAnalyticsJobRoles | null,
	) {
		const trendMax = largest(overview?.trend.map((point) => point.count) ?? []);
		const demandVsSupply = overview?.breakdowns.demandVsSupply ?? [];
		const demandMax = largest(
			demandVsSupply.flatMap((item) => [item.openPositions, item.applications]),
		);

		return {
			query,
			overview,
			table,
			sortLinks: buildSortLinks(query),
			pageLinks: buildPageLinks(query, table),
			trend: (overview?.trend ?? []).map((point) => ({
				...point,
				height: percentOf(point.count, trendMax),
			})),
			demandVsSupply: demandVsSupply.map((item) => ({
				...item,
				openPositionsWidth: percentOf(item.openPositions, demandMax),
				applicationsWidth: percentOf(item.applications, demandMax),
			})),
			filterOptions: {
				capabilities: (overview?.breakdowns.byCapability ?? []).map(
					(item) => item.label,
				),
				bands: (overview?.breakdowns.byBand ?? []).map((item) => item.label),
				statuses: (overview?.breakdowns.byRoleStatus ?? []).map(
					(item) => item.label,
				),
			},
		};
	}
}
