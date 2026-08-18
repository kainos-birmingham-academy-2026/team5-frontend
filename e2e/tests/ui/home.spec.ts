import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Careers home", () => {
	test.beforeEach(async ({ homePage }) => {
		await homePage.goto();
	});

	test("shows the hero and primary call to action", async ({ homePage }) => {
		await expect(homePage.page).toHaveTitle(/Home/);
		await expect(homePage.heroHeading).toBeVisible();
		await expect(homePage.browseOpportunitiesButton).toBeVisible();
	});

	test("navigates to the opportunities page", async ({ homePage }) => {
		await homePage.browseOpportunities();

		await expect(homePage.page).toHaveURL(/\/job-roles$/);
	});

	test("shows the featured opportunities section", async ({ homePage }) => {
		await expect(homePage.featuredRolesHeading).toBeVisible();
	});
});

/*
 * Requires the local database (featured roles are served by the API).
 *
 * test.describe("Careers home (database required)", () => {
 * 	test("lists up to four featured roles", async ({ homePage }) => {
 * 		await homePage.goto();
 *
 * 		expect(await homePage.featuredRoleCount()).toBeGreaterThan(0);
 * 		expect(await homePage.featuredRoleCount()).toBeLessThanOrEqual(4);
 * 	});
 * });
 */
