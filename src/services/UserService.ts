import apiClient from "../config/apiClient";

type LoginResponse = {
	token: string;
};

export class UserService {
	async login(email: string, password: string): Promise<string> {
		const loginPath = process.env.AUTH_LOGIN_PATH ?? "/auth/login";
		const response = await apiClient.post<LoginResponse>(loginPath, {
			email,
			password,
		});
		return response.data.token;
	}
}
