import { randomUUID } from "node:crypto";

export const validPassword = "Playwright!123";

export const uniqueEmail = (prefix = "e2e"): string =>
	`${prefix}-${randomUUID()}@example.com`;

export const invalidCredentials = {
	email: "not-a-user@example.com",
	password: "WrongPassword!1",
};

export const weakPasswords = {
	tooShort: "Ab!1",
	noUppercase: "playwright!123",
	noSpecialCharacter: "Playwright123",
};
