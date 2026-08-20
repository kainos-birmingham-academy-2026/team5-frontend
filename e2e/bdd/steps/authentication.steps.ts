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

When("I sign in with the registered credentials", async function () {
	const { email, password } = this.credentials;
	this.loginResponse = await this.loginPage.login(email, password);
});

When("I sign in with credentials that do not exist", async function () {
	this.loginResponse = await this.loginPage.login(
		invalidCredentials.email,
		invalidCredentials.password,
	);
});

When(
	"I submit the login form with the registered credentials",
	async function () {
		const { email, password } = this.credentials;
		this.loginResponse = await this.loginPage.login(email, password);
	},
);

When(
	"I submit the login form with credentials that do not exist",
	async function () {
		this.loginResponse = await this.loginPage.login(
			invalidCredentials.email,
			invalidCredentials.password,
		);
	},
);

When("I sign out", async function () {
	await this.loginPage.header.signOut();
});

Then("the sign in form is shown", async function () {
	await expect(this.page).toHaveTitle(/Login/);
	await expect(this.loginPage.heading).toBeVisible();
	await expect(this.loginPage.emailInput).toBeVisible();
	await expect(this.loginPage.passwordInput).toHaveAttribute(
		"type",
		"password",
	);
});

Then("the sign in page is shown", async function () {
	await expect(this.page).toHaveURL(/\/login$/);
	await expect(this.loginPage.heading).toBeVisible();
});

Then("the register page is shown", async function () {
	await expect(this.page).toHaveURL(/\/register$/);
	await expect(this.registerPage.heading).toBeVisible();
});

Then("the careers home page is shown", async function () {
	await expect(this.page).toHaveURL(/\/$/);
	await expect(this.homePage.heroHeading).toBeVisible();
});

Then("the password rules are satisfied:", async function (table: DataTable) {
	for (const rule of rulesFrom(table)) {
		await expect(this.registerPage.passwordRule(rule)).toHaveAttribute(
			"aria-checked",
			"true",
		);
	}
});

Then(
	"the password rules are not satisfied:",
	async function (table: DataTable) {
		for (const rule of rulesFrom(table)) {
			await expect(this.registerPage.passwordRule(rule)).toHaveAttribute(
				"aria-checked",
				"false",
			);
		}
	},
);

Then("I see the confirmation {string}", async function (message: string) {
	await expect(this.homePage.successToast).toContainText(message);
});

Then("I see the error {string}", async function (message: string) {
	await expect(this.loginPage.errorMessage).toHaveText(message);
});

Then(
	"the login form is submitted successfully with status {int}",
	async function (status: number) {
		expect(this.loginResponse).toBeDefined();
		expect(this.loginResponse?.status()).toBe(status);
		expect(this.loginResponse?.headers().location).toBe("/");
	},
);

Then(
	"the login form submission is rejected with status {int}",
	async function (status: number) {
		expect(this.loginResponse).toBeDefined();
		expect(this.loginResponse?.status()).toBe(status);
		expect(this.loginResponse?.ok()).toBe(false);
	},
);

Then("an error message is shown", async function () {
	await expect(this.loginPage.errorMessage).toBeVisible();
	await expect(this.loginPage.errorMessage).not.toHaveText("");
});

Then("I am signed in", async function () {
	await expect(this.loginPage.header.signOutLink).toBeVisible();
});

Then("I am signed out", async function () {
	await expect(this.loginPage.header.signInLink).toBeVisible();
});
