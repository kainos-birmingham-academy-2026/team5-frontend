import {
	invalidCredentials,
	uniqueEmail,
	validPassword,
	weakPasswords,
} from "../../fixtures/test-data";
import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Sign in form", () => {
	test("renders the sign in form", async ({ loginPage }) => {
		await loginPage.goto();

		await expect(loginPage.page).toHaveTitle(/Login/);
		await expect(loginPage.heading).toBeVisible();
		await expect(loginPage.emailInput).toHaveAttribute("type", "email");
		await expect(loginPage.emailInput).toHaveAttribute("required", "");
		await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
		await expect(loginPage.passwordInput).toHaveAttribute("required", "");
		await expect(loginPage.errorMessage).toHaveCount(0);
	});

	test("blocks submission of an empty form", async ({ loginPage }) => {
		await loginPage.goto();
		await loginPage.submitButton.click();

		await expect(loginPage.page).toHaveURL(/\/login$/);
		await expect(loginPage.errorMessage).toHaveCount(0);
	});

	test("moves to the register page", async ({ loginPage }) => {
		await loginPage.goto();
		await loginPage.goToRegister();

		await expect(loginPage.page).toHaveURL(/\/register$/);
	});
});

test.describe("Register form", () => {
	test("renders the register form with an untouched checklist", async ({
		registerPage,
	}) => {
		await registerPage.goto();

		await expect(registerPage.page).toHaveTitle(/Register/);
		await expect(registerPage.heading).toBeVisible();
		await expect(registerPage.passwordChecklist).toHaveAttribute(
			"data-touched",
			"false",
		);
		await expect(registerPage.passwordInput).toHaveAttribute(
			"aria-describedby",
			"password-requirements",
		);
	});

	test("ticks each password rule as it is satisfied", async ({
		registerPage,
	}) => {
		await registerPage.goto();

		await registerPage.enterPassword(weakPasswords.tooShort);
		await expect(registerPage.passwordChecklist).toHaveAttribute(
			"data-touched",
			"true",
		);
		await expect(registerPage.passwordRule("length")).toHaveAttribute(
			"aria-checked",
			"false",
		);
		await expect(registerPage.passwordRule("uppercase")).toHaveAttribute(
			"aria-checked",
			"true",
		);

		await registerPage.enterPassword(weakPasswords.noUppercase);
		await expect(registerPage.passwordRule("uppercase")).toHaveAttribute(
			"aria-checked",
			"false",
		);

		await registerPage.enterPassword(weakPasswords.noSpecialCharacter);
		await expect(registerPage.passwordRule("special")).toHaveAttribute(
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

	test("moves to the sign in page", async ({ registerPage }) => {
		await registerPage.goto();
		await registerPage.goToLogin();

		await expect(registerPage.page).toHaveURL(/\/login$/);
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
		await registerPage.header.openNavigation();
		await expect(registerPage.header.signOutLink).toBeVisible();
	});

	test("rejects a duplicate email", async ({
		registerPage,
		registeredUser,
	}) => {
		await registerPage.goto();
		await registerPage.register(registeredUser.email, registeredUser.password);

		await expect(registerPage.errorMessage).toHaveText(
			"Unable to register with these details",
		);
		await expect(registerPage.page).toHaveURL(/\/register$/);
	});

	test("signs in an existing candidate", async ({
		loginPage,
		registeredUser,
	}) => {
		await loginPage.goto();
		await loginPage.login(registeredUser.email, registeredUser.password);

		await expect(loginPage.page).toHaveURL(/\/$/);
		await loginPage.header.openNavigation();
		await expect(loginPage.header.signOutLink).toBeVisible();
		await expect(loginPage.header.signInLink).toHaveCount(0);
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
		await expect(loginPage.emailInput).toHaveValue(invalidCredentials.email);
	});

	test("redirects a signed in candidate away from the sign in page", async ({
		loginPage,
		registeredUser,
	}) => {
		await loginPage.goto();
		await loginPage.login(registeredUser.email, registeredUser.password);

		await loginPage.goto();

		await expect(loginPage.page).toHaveURL(/\/$/);
	});

	test("signs the candidate out", async ({ loginPage, registeredUser }) => {
		await loginPage.goto();
		await loginPage.login(registeredUser.email, registeredUser.password);
		await loginPage.header.signOut();

		await expect(loginPage.page).toHaveURL(/\/login$/);
		await loginPage.header.openNavigation();
		await expect(loginPage.header.signInLink).toBeVisible();
		await expect(loginPage.header.signOutLink).toHaveCount(0);
	});
});
