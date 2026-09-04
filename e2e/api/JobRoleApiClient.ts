import { BaseApiClient, type QueryParams } from "./BaseApiClient";

export type JobRole = {
	jobRoleId: number;
	roleName: string;
	location: string;
	capabilityName?: string;
	bandName?: string;
	closingDate: string;
	status?: string;
	description?: string | null;
};

export type PaginatedJobRoles = {
	items: JobRole[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export type JobRoleFilterOptions = {
	capabilities: string[];
	bands: string[];
	statuses: string[];
};

export type ApiError = {
	error: string;
};

export type JobRoleSortField =
	| "roleName"
	| "location"
	| "capability"
	| "band"
	| "closingDate"
	| "status";

export type JobRoleQuery = {
	page?: number;
	pageSize?: number;
	roleName?: string;
	location?: string;
	closingDate?: string;
	capability?: string[];
	band?: string[];
	status?: string[];
	sortBy?: JobRoleSortField | string;
	sortOrder?: "asc" | "desc" | string;
};

export class JobRoleApiClient extends BaseApiClient {
	getAll(query: JobRoleQuery = {}) {
		return this.get<PaginatedJobRoles>("/job-roles", query as QueryParams);
	}

	getById(jobRoleId: number | string) {
		return this.get<JobRole & ApiError>(`/job-roles/${jobRoleId}`);
	}

	getFilterOptions() {
		return this.get<JobRoleFilterOptions>("/job-roles/filter-options");
	}

	/** Convenience helper for tests that need any existing role. */
	async getFirstJobRole(): Promise<JobRole | null> {
		const result = await this.getAll({ page: 1, pageSize: 1 });
		return result.ok ? (result.body?.items?.[0] ?? null) : null;
	}
}
