import { randomUUID } from "node:crypto";

/** Meets the backend policy: 9+ chars, upper, lower and a special character. */
export const validPassword = "Playwright!123";

export const uniqueEmail = (prefix = "e2e"): string =>
	`${prefix}-${randomUUID()}@example.com`;

export const invalidCredentials = {
	email: uniqueEmail("unknown"),
	password: "WrongPassword!1",
};

export const weakPasswords = {
	tooShort: "Ab!1",
};

export const seedData = {
	knownRoleName: "Engineer",
};
