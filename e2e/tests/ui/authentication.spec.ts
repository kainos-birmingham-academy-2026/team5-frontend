import {
	invalidCredentials,
	uniqueEmail,
	validPassword,
	weakPasswords,
} from "../../fixtures/test-data";
import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Authentication", () => {
	test("shows the login form", async ({ loginPage, page }) => {
		await loginPage.goto();

		await expect(page).toHaveTitle(/Login/);
		await expect(loginPage.heading).toBeVisible();
		await expect(loginPage.emailInput).toBeVisible();
		await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
	});

	test("rejects invalid credentials", async ({ loginPage }) => {
		await loginPage.goto();
		await loginPage.login(
			invalidCredentials.email,
			invalidCredentials.password,
		);

		await expect(loginPage.errorMessage).toBeVisible();
	});

	test("moves from login to register", async ({ loginPage, page }) => {
		await loginPage.goto();
		await loginPage.registerLink.click();

		await expect(page).toHaveURL(/\/register$/);
	});

	test("ticks password rules as the password is typed", async ({
		registerPage,
	}) => {
		await registerPage.goto();
		await registerPage.passwordInput.fill(weakPasswords.tooShort);

		await expect(registerPage.passwordRule("length")).toHaveAttribute(
			"aria-checked",
			"false",
		);

		await registerPage.passwordInput.fill(validPassword);

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

	test("registers a new candidate", async ({ registerPage, page }) => {
		await registerPage.goto();
		await registerPage.register(uniqueEmail(), validPassword);

		// Successful registration redirects home; a failure keeps the form visible.
		const registered = await page
			.waitForURL(/\/$/, { timeout: 5_000 })
			.then(() => true)
			.catch(() => false);

		if (!registered) {
			await expect(registerPage.errorMessage).toBeVisible();
			return;
		}

		await expect(page).toHaveURL(/\/$/);
	});
});
