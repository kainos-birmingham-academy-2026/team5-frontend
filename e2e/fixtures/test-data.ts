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
	noUppercase: "playwright!123",
	noSpecialCharacter: "Playwright123",
};

export const seedData = {
	capabilities: ["Engineering", "Data", "Product"],
	statuses: ["Open", "Closed"],
	knownRoleName: "Engineer",
	knownCapability: "Data",
	/** Large enough to span more than one page of results. */
	pagedCapability: "Engineering",
	unmatchableRoleName: "no-such-role-zzz",
};
