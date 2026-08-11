import apiClient from "../config/apiClient";

export type JobRole = {
	jobRoleId: number;
	roleName: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: Date;
	status: string;
	capabilityName: string;
	bandName: string;
};

export type PaginatedJobRoles = {
	items: JobRole[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export class JobRoleService {
	async getAllJobRoles(page = 1, pageSize = 10): Promise<PaginatedJobRoles> {
		const response = await apiClient.get<PaginatedJobRoles>("/job-roles", {
			params: { page, pageSize },
		});

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
