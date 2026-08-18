import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Careers home", () => {
	test.beforeEach(async ({ homePage }) => {
		await homePage.goto();
	});

	test("shows the hero and primary call to action", async ({
		homePage,
		page,
	}) => {
		await expect(page).toHaveTitle(/Home/);
		await expect(homePage.heroHeading).toBeVisible();
		await expect(homePage.browseOpportunitiesButton).toBeVisible();
	});

	test("navigates to the opportunities page", async ({ homePage, page }) => {
		await homePage.browseOpportunities();

		await expect(page).toHaveURL(/\/job-roles$/);
	});

	test("lists featured roles or an empty state", async ({ homePage }) => {
		await expect(homePage.featuredRolesHeading).toBeVisible();

		if ((await homePage.featuredRoleCount()) === 0) {
			await expect(homePage.emptyState).toBeVisible();
			return;
		}

		expect(await homePage.featuredRoleCount()).toBeLessThanOrEqual(4);
	});
});
