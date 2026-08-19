import {
	invalidCredentials,
	uniqueEmail,
	validPassword,
	weakPasswords,
} from "../../fixtures/test-data";
import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Sign in and register forms", () => {
	test("renders the sign in form", async ({ loginPage }) => {
		await loginPage.goto();

		await expect(loginPage.page).toHaveTitle(/Login/);
		await expect(loginPage.heading).toBeVisible();
		await expect(loginPage.emailInput).toBeVisible();
		await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
	});

	test("moves between sign in and register", async ({
		loginPage,
		registerPage,
	}) => {
		await loginPage.goto();
		await loginPage.goToRegister();
		await expect(loginPage.page).toHaveURL(/\/register$/);

		await registerPage.goToLogin();
		await expect(registerPage.page).toHaveURL(/\/login$/);
	});

	test("ticks the password rules as they are satisfied", async ({
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

test.describe("Candidate account flows", { tag: "@database" }, () => {
	test("registers a new candidate and signs them in", async ({
		registerPage,
	}) => {
		await registerPage.goto();
		await registerPage.register(uniqueEmail(), validPassword);

		await expect(registerPage.page).toHaveURL(/\/$/);
		await expect(registerPage.successToast).toContainText(
			"Account successfully created.",
		);
		await expect(registerPage.header.signOutLink).toBeVisible();
	});

	test("signs in an existing candidate", async ({
		loginPage,
		registeredUser,
	}) => {
		await loginPage.goto();
		await loginPage.login(registeredUser.email, registeredUser.password);

		await expect(loginPage.page).toHaveURL(/\/$/);
		await expect(loginPage.header.signOutLink).toBeVisible();
	});

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

	test("signs the candidate out", async ({ loginPage, registeredUser }) => {
		await loginPage.goto();
		await loginPage.login(registeredUser.email, registeredUser.password);
		await loginPage.header.signOut();

		await expect(loginPage.page).toHaveURL(/\/login$/);
		await expect(loginPage.header.signInLink).toBeVisible();
	});
});
