import apiClient from "../config/apiClient";

export type JobRole = {
    jobRoleId: number,
    roleName: string,
    location: string,
    capabilityId: number,
    bandId: number,
    closingDate: Date,
    status: string,
};

export class JobRoleService {
    async getAllJobRoles(): Promise<JobRole[]> {
        const response = await apiClient.get<JobRole[]>("/job-roles");
        return response.data;
    }
}

