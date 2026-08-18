import { BaseApiClient } from "./BaseApiClient";

export type AuthResponse = {
	token: string;
};

export type Credentials = {
	email: string;
	password: string;
};

export class AuthApiClient extends BaseApiClient {
	login(credentials: Credentials) {
		return this.post<AuthResponse>(
			process.env.AUTH_LOGIN_PATH ?? "/auth/login",
			credentials,
		);
	}

	register(credentials: Credentials) {
		return this.post<AuthResponse>(
			process.env.AUTH_REGISTER_PATH ?? "/auth/register",
			credentials,
		);
	}
}
