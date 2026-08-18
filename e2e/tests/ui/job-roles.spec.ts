import { seedData } from "../../fixtures/test-data";
import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Browsing jobs", () => {
	test("reaches the job list from the home page", async ({
		homePage,
		jobRoleListPage,
	}) => {
		await homePage.goto();

		await expect(homePage.heroHeading).toBeVisible();
		await homePage.browseOpportunities();

		await expect(jobRoleListPage.page).toHaveURL(/\/job-roles$/);
	});
});

test.describe("Viewing job roles", { tag: "@database" }, () => {
	test.beforeEach(async ({ jobRoleListPage }) => {
		await jobRoleListPage.goto();
	});

	test("lists the advertised roles", async ({ jobRoleListPage }) => {
		await expect(jobRoleListPage.page).toHaveTitle(/Opportunities/);
		await expect(jobRoleListPage.heading).toBeVisible();
		expect(await jobRoleListPage.jobCount()).toBeGreaterThan(0);

		const card = jobRoleListPage.jobCards.first();
		await expect(jobRoleListPage.cardMeta(card, "Location")).not.toBeEmpty();
		await expect(jobRoleListPage.cardMeta(card, "Capability")).not.toBeEmpty();
	});

	test("filters the list by role name", async ({ jobRoleListPage }) => {
		await jobRoleListPage.applyFilters({ roleName: seedData.knownRoleName });

		expect(await jobRoleListPage.jobCount()).toBeGreaterThan(0);
		for (const roleName of await jobRoleListPage.roleNames()) {
			expect(roleName.toLowerCase()).toContain(
				seedData.knownRoleName.toLowerCase(),
			);
		}
	});

	test("opens a role and returns to the list", async ({
		jobRoleListPage,
		jobRoleDetailPage,
	}) => {
		const [firstRoleName] = await jobRoleListPage.roleNames();
		await jobRoleListPage.openJobRole(firstRoleName);

		await expect(jobRoleDetailPage.page).toHaveURL(/\/job-roles\/\d+$/);
		await expect(jobRoleDetailPage.roleHeading).toHaveText(firstRoleName);
		await expect(jobRoleDetailPage.metaValue("Location")).not.toBeEmpty();
		await expect(jobRoleDetailPage.overviewHeading).toBeVisible();

		await jobRoleDetailPage.backToList();
		await expect(jobRoleListPage.heading).toBeVisible();
	});

	test("shows a not found state for an unknown role", async ({
		jobRoleDetailPage,
	}) => {
		await jobRoleDetailPage.gotoRole(999999);

		await expect(jobRoleDetailPage.emptyState).toContainText("Role not found");
	});
});
