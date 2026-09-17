import "express-session";

declare module "express-session" {
	interface SessionData {
		jwtToken?: string;
		userRoleId?: number;
		registrationSuccessMessage?: string;
		flashSuccess?: string;
		flashError?: string;
		returnTo?: string;
	}
}
