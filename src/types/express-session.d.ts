import "express-session";

declare module "express-session" {
	interface SessionData {
		jwtToken?: string;
		userRole?: string;
		registrationSuccessMessage?: string;
	}
}
