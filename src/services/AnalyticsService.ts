import apiClient from "../config/apiClient";
import type {
	AnalyticsOverview,
	AnalyticsRangeQuery,
	AnalyticsTableQuery,
	PaginatedAnalyticsJobRoles,
} from "../types/analytics";

const authorizationHeader = (jwtToken: string | undefined) => ({
	headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined,
});

const rangeParams = (range: AnalyticsRangeQuery) => ({
	preset: range.preset,
	from: range.from,
	to: range.to,
});

export class AnalyticsService {
	async getOverview(
		range: AnalyticsRangeQuery,
		jwtToken?: string,
	): Promise<AnalyticsOverview> {
		const response = await apiClient.get<AnalyticsOverview>(
			"/analytics/overview",
			{
				params: rangeParams(range),
				...authorizationHeader(jwtToken),
			},
		);

		return response.data;
	}

	async getJobRoles(
		query: AnalyticsTableQuery,
		jwtToken?: string,
	): Promise<PaginatedAnalyticsJobRoles> {
		const response = await apiClient.get<PaginatedAnalyticsJobRoles>(
			"/analytics/job-roles",
			{
				params: {
					...rangeParams(query),
					page: query.page,
					pageSize: query.pageSize,
					sortBy: query.sortBy,
					sortOrder: query.sortOrder,
					capability: query.capability,
					band: query.band,
					status: query.status,
					location: query.location,
					roleName: query.roleName,
				},
				paramsSerializer: { indexes: null },
				...authorizationHeader(jwtToken),
			},
		);

		return response.data;
	}
}
