import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Site navigation", () => {
	test("shows the shared header and footer", async ({ homePage }) => {
		await homePage.goto();

		await expect(homePage.header.root).toBeVisible();
		await expect(homePage.footer.root).toBeVisible();
		await expect(homePage.footer.contactEmailLink).toHaveAttribute(
			"href",
			"mailto:careers@kainos.com",
		);
	});

	test("offers a skip link to the main content", async ({ homePage }) => {
		await homePage.goto();

		await expect(homePage.skipLink).toHaveAttribute("href", "#main-content");
	});

	test("shows sign in while signed out", async ({ homePage }) => {
		await homePage.goto();
		await homePage.header.openNavigation();

		await expect(homePage.header.signInLink).toBeVisible();
		await expect(homePage.header.signOutLink).toHaveCount(0);
	});

	test("navigates to the sign in page from the header", async ({
		homePage,
		loginPage,
	}) => {
		await homePage.goto();
		await homePage.header.goToSignIn();

		await expect(homePage.page).toHaveURL(/\/login$/);
		await expect(loginPage.heading).toBeVisible();
	});

	test("returns home from the header", async ({ loginPage }) => {
		await loginPage.goto();
		await loginPage.header.goToHome();

		await expect(loginPage.page).toHaveURL(/\/$/);
	});
});

test.describe("Mobile navigation", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test("toggles the collapsed menu", async ({ homePage }) => {
		await homePage.goto();

		await expect(homePage.header.navToggle).toBeVisible();
		expect(await homePage.header.isNavigationOpen()).toBe(false);

		await homePage.header.openNavigation();
		expect(await homePage.header.isNavigationOpen()).toBe(true);
		await expect(homePage.header.signInLink).toBeVisible();

		await homePage.header.closeNavigation();
		expect(await homePage.header.isNavigationOpen()).toBe(false);
	});

	test("closes the menu with the Escape key", async ({ homePage }) => {
		await homePage.goto();
		await homePage.header.openNavigation();

		await homePage.page.keyboard.press("Escape");

		expect(await homePage.header.isNavigationOpen()).toBe(false);
	});
});

test.describe("Navigation to opportunities", { tag: "@database" }, () => {
	test("reaches the job list from the header", async ({
		homePage,
		jobRoleListPage,
	}) => {
		await homePage.goto();
		await homePage.header.goToOpportunities();

		await expect(homePage.page).toHaveURL(/\/job-roles$/);
		await expect(jobRoleListPage.heading).toBeVisible();
	});

	test("reaches the job list from the footer", async ({ homePage }) => {
		await homePage.goto();
		await homePage.footer.browseOpportunitiesLink.click();

		await expect(homePage.page).toHaveURL(/\/job-roles$/);
	});
});
