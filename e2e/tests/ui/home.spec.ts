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

test.describe("Careers home (database)", { tag: "@database" }, () => {
	test("lists up to four featured roles", async ({ homePage }) => {
		await homePage.goto();

		const count = await homePage.featuredRoleCount();
		expect(count).toBeGreaterThan(0);
		expect(count).toBeLessThanOrEqual(4);
	});

	test("opens a featured role", async ({ homePage, jobRoleDetailPage }) => {
		await homePage.goto();
		await homePage.openFeaturedRole();

		await expect(homePage.page).toHaveURL(/\/job-roles\/\d+$/);
		await expect(jobRoleDetailPage.detailCard).toBeVisible();
	});
});
