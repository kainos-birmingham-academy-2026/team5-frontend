import apiClient from "../config/apiClient";

export type JobRole = {
    jobRoleId: number,
    roleName: string,
    location: string,
    capabilityId: number,
    bandId: number,
    closingDate: Date,
    status: string,
    capabilityName: string,
    bandName: string,
};

export class JobRoleService {
    async getAllJobRoles(): Promise<JobRole[]> {
        const response = await apiClient.get<JobRole[]>("/job-roles");
        return response.data;
    }

    async getJobRoleById(jobRoleId: number): Promise<JobRole | null> {
        try {
            const response = await apiClient.get<JobRole>(`/job-roles/${jobRoleId}`);
            return response.data;
        } catch {
            const roles = await this.getAllJobRoles();
            return roles.find((role) => role.jobRoleId === jobRoleId) ?? null;
        }
    }
}

