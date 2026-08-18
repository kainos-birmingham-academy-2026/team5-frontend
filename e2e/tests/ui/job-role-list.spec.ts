import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Job role list", () => {
	test.beforeEach(async ({ apiAvailable, jobRoleListPage }) => {
		test.skip(!apiAvailable, "Backend API is not available.");
		await jobRoleListPage.goto();
	});

	test("shows the vacancies section and header navigation", async ({
		jobRoleListPage,
		page,
	}) => {
		await expect(page).toHaveTitle(/Opportunities/);
		await expect(jobRoleListPage.heading).toBeVisible();
		await expect(jobRoleListPage.header.opportunitiesLink).toBeVisible();
	});

	test("renders job cards or an empty state", async ({ jobRoleListPage }) => {
		const count = await jobRoleListPage.jobCount();

		if (count === 0) {
			await expect(jobRoleListPage.emptyState).toBeVisible();
			return;
		}

		await expect(jobRoleListPage.jobCards.first()).toBeVisible();
		await expect(
			jobRoleListPage.jobCards.first().getByRole("link", { name: "View role" }),
		).toBeVisible();
	});

	test("keeps the filter panel open after applying a role name filter", async ({
		jobRoleListPage,
		page,
	}) => {
		await jobRoleListPage.applyFilters({ roleName: "Engineer" });

		await expect(page).toHaveURL(/roleName=Engineer/);
		await expect(jobRoleListPage.filterPanel).toHaveAttribute("open", "");
		await expect(jobRoleListPage.roleNameInput).toHaveValue("Engineer");
	});

	test("clears filters", async ({ jobRoleListPage, page }) => {
		await jobRoleListPage.applyFilters({ location: "Belfast" });
		await jobRoleListPage.clearFiltersLink.click();

		await expect(page).toHaveURL(/\/job-roles$/);
		await expect(jobRoleListPage.locationInput).toHaveValue("");
	});
});
