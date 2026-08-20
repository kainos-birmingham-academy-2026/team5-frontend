import type { DataTable } from "playwright-bdd";
import { invalidCredentials, validPassword } from "../../fixtures/test-data";
import type { PasswordRule } from "../../pages/RegisterPage";
import { expect, Given, Then, When } from "../fixtures";

const rulesFrom = (table: DataTable): PasswordRule[] =>
	table.raw().flat() as PasswordRule[];

Given("I am on the sign in page", async function () {
	await this.loginPage.goto();
});

Given("I am on the register page", async function () {
	await this.registerPage.goto();
});

Given("a registered candidate account exists", async function () {
	await this.provisionCandidate();
});

When("I follow the link to create an account", async function () {
	await this.loginPage.goToRegister();
});

When("I follow the link to sign in", async function () {
	await this.registerPage.goToLogin();
});

When("I type the password {string}", async function (password: string) {
	await this.registerPage.enterPassword(password);
});

When("I type a valid password", async function () {
	await this.registerPage.enterPassword(validPassword);
});

When(
	"I register with a new email address and a valid password",
	async function () {
		const { email, password } = this.newCandidate();
		await this.registerPage.register(email, password);
	},
);

When("I sign in with valid credentials", async function () {
	const { email, password } = this.credentials;
	this.loginResponse = await this.loginPage.login(email, password);
});

When("I sign in with invalid credentials", async function () {
	this.loginResponse = await this.loginPage.login(
		invalidCredentials.email,
		invalidCredentials.password,
	);
});

When("I sign out", async function () {
	await this.loginPage.header.signOut();
});

Then("the sign in form is shown", async function () {
	await expect(
		this.page,
		"Sign in page should use the Login title",
	).toHaveTitle(/Login/);
	await expect(
		this.loginPage.heading,
		"Sign in heading should be visible",
	).toBeVisible();
	await expect(
		this.loginPage.emailInput,
		"Email field should be visible on the sign in form",
	).toBeVisible();
	await expect(
		this.loginPage.passwordInput,
		"Password field should be a password input",
	).toHaveAttribute("type", "password");
});

Then("the sign in page is shown", async function () {
	await expect(this.page, "Should be on the sign in page").toHaveURL(
		/\/login$/,
	);
	await expect(
		this.loginPage.heading,
		"Sign in heading should be visible",
	).toBeVisible();
});

Then("the register page is shown", async function () {
	await expect(this.page, "Should be on the register page").toHaveURL(
		/\/register$/,
	);
	await expect(
		this.registerPage.heading,
		"Register heading should be visible",
	).toBeVisible();
});

Then("the careers home page is shown", async function () {
	await expect(this.page, "Should be on the careers home page").toHaveURL(
		/\/$/,
	);
	await expect(
		this.homePage.heroHeading,
		"Home page heading should be visible",
	).toBeVisible();
});

Then("the password rules are satisfied:", async function (table: DataTable) {
	for (const rule of rulesFrom(table)) {
		await expect(
			this.registerPage.passwordRule(rule),
			`Password rule "${rule}" should be marked as satisfied`,
		).toHaveAttribute("aria-checked", "true");
	}
});

Then(
	"the password rules are not satisfied:",
	async function (table: DataTable) {
		for (const rule of rulesFrom(table)) {
			await expect(
				this.registerPage.passwordRule(rule),
				`Password rule "${rule}" should not be marked as satisfied`,
			).toHaveAttribute("aria-checked", "false");
		}
	},
);

Then("I see the confirmation {string}", async function (message: string) {
	await expect(
		this.homePage.successToast,
		`Success toast should contain "${message}"`,
	).toContainText(message);
});

Then("I am signed in", async function () {
	await expect(
		this.loginPage.header.signOutLink,
		"Sign out link should be visible when signed in",
	).toBeVisible();
});

Then("I am successfully signed in", async function () {
	expect(
		this.loginResponse,
		"Login response should have been captured",
	).toBeDefined();
	expect(
		this.loginResponse?.status(),
		`Expected successful sign in to redirect with 302, got ${this.loginResponse?.status()}`,
	).toBe(302);
	expect(
		this.loginResponse?.headers().location,
		"Successful sign in should redirect to the careers home page",
	).toBe("/");

	await expect(
		this.page,
		"Should land on the careers home page after a successful sign in",
	).toHaveURL(/\/$/);
	await expect(
		this.homePage.heroHeading,
		"Home page heading should be visible after a successful sign in",
	).toBeVisible();
	await expect(
		this.loginPage.header.signOutLink,
		"Sign out link should be visible after a successful sign in",
	).toBeVisible();
});

Then("I am not signed in", async function () {
	expect(
		this.loginResponse,
		"Login response should have been captured",
	).toBeDefined();
	expect(
		this.loginResponse?.status(),
		`Expected invalid credentials to be rejected with 401, got ${this.loginResponse?.status()}`,
	).toBe(401);
	expect(
		this.loginResponse?.ok(),
		"Rejected sign in should not be a successful HTTP response",
	).toBe(false);

	await expect(
		this.page,
		"Should remain on the sign in page after invalid credentials",
	).toHaveURL(/\/login/);
	await expect(
		this.loginPage.errorMessage,
		"Invalid credentials should show an error message",
	).toHaveText("Email or password is incorrect");
	await expect(
		this.loginPage.header.signInLink,
		"Sign in link should still be visible when sign in fails",
	).toBeVisible();
});

Then("I am returned to the sign in page", async function () {
	await expect(
		this.page,
		"Should be returned to the sign in page after signing out",
	).toHaveURL(/\/login$/);
	await expect(
		this.loginPage.heading,
		"Sign in heading should be visible after signing out",
	).toBeVisible();
	await expect(
		this.loginPage.header.signInLink,
		"Sign in link should be visible after signing out",
	).toBeVisible();
});
