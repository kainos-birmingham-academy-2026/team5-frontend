import { BaseApiClient } from "./BaseApiClient";

export type AuthUser = {
	id: string;
	email: string;
	roleId: number;
};

export type AuthResponse = {
	user: AuthUser;
	token: string;
	/** Populated instead of user/token on failure; Zod issues come back as an array. */
	error?: string | { message: string }[];
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
