import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Job role list", { tag: "@database" }, () => {
	test.beforeEach(async ({ jobRoleListPage }) => {
		await jobRoleListPage.goto();
	});

	test("shows the vacancies section and header navigation", async ({
		jobRoleListPage,
	}) => {
		await expect(jobRoleListPage.page).toHaveTitle(/Opportunities/);
		await expect(jobRoleListPage.heading).toBeVisible();

		await jobRoleListPage.header.openNavigation();
		await expect(jobRoleListPage.header.opportunitiesLink).toBeVisible();
	});

	test("renders job cards", async ({ jobRoleListPage }) => {
		expect(await jobRoleListPage.jobCount()).toBeGreaterThan(0);
		await expect(jobRoleListPage.jobCards.first()).toBeVisible();
		await expect(jobRoleListPage.viewRoleLink()).toBeVisible();
	});

	test("keeps the filter panel open after applying a role name filter", async ({
		jobRoleListPage,
	}) => {
		await jobRoleListPage.applyFilters({ roleName: "Engineer" });

		await expect(jobRoleListPage.page).toHaveURL(/roleName=Engineer/);
		await expect(jobRoleListPage.filterPanel).toHaveAttribute("open", "");
		await expect(jobRoleListPage.roleNameInput).toHaveValue("Engineer");
	});

	test("clears filters", async ({ jobRoleListPage }) => {
		await jobRoleListPage.applyFilters({ location: "Belfast" });
		await jobRoleListPage.clearFilters();

		await expect(jobRoleListPage.page).toHaveURL(/\/job-roles$/);
		await expect(jobRoleListPage.locationInput).toHaveValue("");
	});
});
