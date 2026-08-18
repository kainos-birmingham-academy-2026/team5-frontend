import {
	invalidCredentials,
	uniqueEmail,
	validPassword,
	weakPasswords,
} from "../../fixtures/test-data";
import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Authentication", () => {
	test("shows the login form", async ({ loginPage }) => {
		await loginPage.goto();

		await expect(loginPage.page).toHaveTitle(/Login/);
		await expect(loginPage.heading).toBeVisible();
		await expect(loginPage.emailInput).toBeVisible();
		await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
	});

	test("moves from login to register", async ({ loginPage }) => {
		await loginPage.goto();
		await loginPage.goToRegister();

		await expect(loginPage.page).toHaveURL(/\/register$/);
	});

	test("moves from register to login", async ({ registerPage }) => {
		await registerPage.goto();
		await registerPage.goToLogin();

		await expect(registerPage.page).toHaveURL(/\/login$/);
	});

	test("ticks password rules as the password is typed", async ({
		registerPage,
	}) => {
		await registerPage.goto();
		await registerPage.enterPassword(weakPasswords.tooShort);

		await expect(registerPage.passwordRule("length")).toHaveAttribute(
			"aria-checked",
			"false",
		);

		await registerPage.enterPassword(validPassword);

		for (const rule of [
			"length",
			"uppercase",
			"lowercase",
			"special",
		] as const) {
			await expect(registerPage.passwordRule(rule)).toHaveAttribute(
				"aria-checked",
				"true",
			);
		}
	});
});

test.describe("Authentication (database)", { tag: "@database" }, () => {
	test("rejects invalid credentials", async ({ loginPage }) => {
		await loginPage.goto();
		await loginPage.login(
			invalidCredentials.email,
			invalidCredentials.password,
		);

		await expect(loginPage.errorMessage).toHaveText(
			"Email or password is incorrect",
		);
	});

	test("registers a new candidate", async ({ registerPage }) => {
		await registerPage.goto();
		await registerPage.register(uniqueEmail(), validPassword);

		await expect(registerPage.page).toHaveURL(/\/$/);
		await expect(registerPage.header.signOutLink).toBeVisible();
	});
});
