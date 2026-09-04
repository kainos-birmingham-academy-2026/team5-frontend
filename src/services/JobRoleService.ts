import apiClient from "../config/apiClient";

export type JobRole = {
	jobRoleId: number;
	roleName: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: Date;
	status?: string;
	description?: string | null;
	responsibilities?: string | null;
	sharepointUrl?: string | null;
	statusId?: number | null;
	numberOfOpenPositions?: number | null;
	capabilityName?: string;
	bandName?: string;
	capability?: {
		capabilityName?: string;
		name?: string;
	};
	band?: {
		bandName?: string;
		name?: string;
	};
	statusRef?: {
		statusName?: string;
	};
};

export type PaginatedJobRoles = {
	items: JobRole[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export type JobRoleFilters = {
	roleName?: string;
	location?: string;
	capability: string[];
	band: string[];
	status: string[];
	closingDate?: string;
};

export type JobRoleFilterOptions = {
	capabilities: string[];
	bands: string[];
	statuses: string[];
};

export const JOB_ROLE_SORT_FIELDS = [
	"roleName",
	"location",
	"capability",
	"band",
	"closingDate",
	"status",
] as const;

export type JobRoleSortField = (typeof JOB_ROLE_SORT_FIELDS)[number];
export type JobRoleSortOrder = "asc" | "desc";

export type JobRoleSort = {
	sortBy?: JobRoleSortField;
	sortOrder?: JobRoleSortOrder;
};

const emptyFilters = (): JobRoleFilters => ({
	capability: [],
	band: [],
	status: [],
});

export class JobRoleService {
	async getAllJobRoles(
		page = 1,
		pageSize = 10,
		filters: JobRoleFilters = emptyFilters(),
		sort: JobRoleSort = {},
	): Promise<PaginatedJobRoles> {
		const response = await apiClient.get<PaginatedJobRoles>("/job-roles", {
			params: {
				page,
				pageSize,
				...filters,
				...(sort.sortBy
					? { sortBy: sort.sortBy, sortOrder: sort.sortOrder ?? "asc" }
					: {}),
			},
			paramsSerializer: { indexes: null },
		});

		return response.data;
	}

	async getFilterOptions(): Promise<JobRoleFilterOptions> {
		const response = await apiClient.get<JobRoleFilterOptions>(
			"/job-roles/filter-options",
		);
		return response.data;
	}

	async getJobRoleInformation(jobRoleId: number): Promise<JobRole | null> {
		try {
			const response = await apiClient.get<JobRole>(`/job-roles/${jobRoleId}`);
			return response.data;
		} catch {
			const roles = await this.getAllJobRoles();
			return roles.items.find((role) => role.jobRoleId === jobRoleId) ?? null;
		}
	}

	async getJobRoleById(jobRoleId: number): Promise<JobRole | null> {
		return this.getJobRoleInformation(jobRoleId);
	}
}
