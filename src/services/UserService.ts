import apiClient from "../config/apiClient";

type LoginResponse = {
	token: string;
};

export class UserService {
	async login(email: string, password: string): Promise<string> {
		const response = await apiClient.post<LoginResponse>("/auth/login", {
			email,
			password,
		});
		return response.data.token;
	}
}
