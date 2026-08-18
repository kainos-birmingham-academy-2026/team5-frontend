import { BaseApiClient } from "./BaseApiClient";

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

export type JobRoleQuery = {
	page?: number;
	pageSize?: number;
	roleName?: string;
	location?: string;
	closingDate?: string;
};

export class JobRoleApiClient extends BaseApiClient {
	getAll(query: JobRoleQuery = {}) {
		const params: Record<string, string | number> = {};
		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined) params[key] = value;
		}
		return this.get<PaginatedJobRoles>("/job-roles", params);
	}

	getById(jobRoleId: number) {
		return this.get<JobRole>(`/job-roles/${jobRoleId}`);
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
