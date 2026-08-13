import apiClient from "../config/apiClient";

type AuthenticationResponse = {
	token: string;
};

export class UserService {
	async login(email: string, password: string): Promise<string> {
		const loginPath = process.env.AUTH_LOGIN_PATH ?? "/auth/login";
		const response = await apiClient.post<AuthenticationResponse>(loginPath, {
			email,
			password,
		});
		return response.data.token;
	}

	async register(email: string, password: string): Promise<string> {
		const registerPath = process.env.AUTH_REGISTER_PATH ?? "/auth/register";
		const response = await apiClient.post<AuthenticationResponse>(
			registerPath,
			{
				email,
				password,
			},
		);
		return response.data.token;
	}
}
