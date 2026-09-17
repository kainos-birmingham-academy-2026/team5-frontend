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

export type JobApplication = {
	applicationId: number;
	applicantId: string;
	jobRoleId: number;
	cvFileName: string;
	cvMimeType: string;
	status: string;
	createdAt: string;
	updatedAt: string;
};

export type UploadedCvFile = {
	originalname: string;
	mimetype: string;
	buffer: Buffer;
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

export type JobRoleReferenceOptions = {
	capabilities: { capabilityId: number; capabilityName: string }[];
	bands: { nameId: number; bandName: string }[];
};

export type JobRoleFormInput = {
	roleName: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: string;
	description?: string;
	responsibilities?: string;
	sharepointUrl?: string;
	numberOfOpenPositions?: number;
	status?: string;
};

const emptyFilters = (): JobRoleFilters => ({
	capability: [],
	band: [],
	status: [],
});

const authorizationHeader = (jwtToken: string | undefined) => ({
	headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined,
});

export class JobRoleService {
	canApplyToJobRole(jobRole: JobRole): boolean {
		const status = jobRole.statusRef?.statusName ?? jobRole.status;
		return (
			status?.toLowerCase() === "open" &&
			(jobRole.numberOfOpenPositions ?? 0) > 0
		);
	}

	async getAllJobRoles(
		page = 1,
		pageSize = 10,
		filters: JobRoleFilters = emptyFilters(),
		jwtToken?: string,
	): Promise<PaginatedJobRoles> {
		const response = await apiClient.get<PaginatedJobRoles>("/job-roles", {
			params: { page, pageSize, ...filters },
			paramsSerializer: { indexes: null },
			...authorizationHeader(jwtToken),
		});

		return response.data;
	}

	async getFilterOptions(jwtToken?: string): Promise<JobRoleFilterOptions> {
		const response = await apiClient.get<JobRoleFilterOptions>(
			"/job-roles/filter-options",
			authorizationHeader(jwtToken),
		);
		return response.data;
	}

	async getJobRoleInformation(
		jobRoleId: number,
		jwtToken?: string,
	): Promise<JobRole | null> {
		try {
			const response = await apiClient.get<JobRole>(
				`/job-roles/${jobRoleId}`,
				authorizationHeader(jwtToken),
			);
			return response.data;
		} catch {
			const roles = await this.getAllJobRoles(1, 10, emptyFilters(), jwtToken);
			return roles.items.find((role) => role.jobRoleId === jobRoleId) ?? null;
		}
	}

	async getJobRoleById(
		jobRoleId: number,
		jwtToken?: string,
	): Promise<JobRole | null> {
		return this.getJobRoleInformation(jobRoleId, jwtToken);
	}

	async getReferenceOptions(
		jwtToken?: string,
	): Promise<JobRoleReferenceOptions> {
		const response = await apiClient.get<JobRoleReferenceOptions>(
			"/job-roles/reference-data",
			authorizationHeader(jwtToken),
		);
		return response.data;
	}

	async createJobRole(
		data: JobRoleFormInput,
		jwtToken?: string,
	): Promise<JobRole> {
		const response = await apiClient.post<JobRole>(
			"/job-roles",
			data,
			authorizationHeader(jwtToken),
		);
		return response.data;
	}

	async updateJobRole(
		jobRoleId: number,
		data: Partial<JobRoleFormInput>,
		jwtToken?: string,
	): Promise<JobRole> {
		const response = await apiClient.put<JobRole>(
			`/job-roles/${jobRoleId}`,
			data,
			authorizationHeader(jwtToken),
		);
		return response.data;
	}

	async deleteJobRole(jobRoleId: number, jwtToken?: string): Promise<void> {
		await apiClient.delete(
			`/job-roles/${jobRoleId}`,
			authorizationHeader(jwtToken),
		);
	}

	async submitJobApplication(
		jobRoleId: number,
		file: UploadedCvFile,
		jwtToken?: string,
	): Promise<JobApplication> {
		const formData = new FormData();
		const cvData = Uint8Array.from(file.buffer);
		formData.append(
			"cv",
			new File([cvData], file.originalname, { type: file.mimetype }),
		);

		const response = await apiClient.post<JobApplication>(
			`/job-roles/${jobRoleId}/applications`,
			formData,
			{
				headers: authorizationHeader(jwtToken).headers,
				timeout: 30000,
			},
		);
		return response.data;
	}
}
