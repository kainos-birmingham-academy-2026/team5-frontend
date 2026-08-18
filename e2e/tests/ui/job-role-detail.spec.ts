import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Job role detail", { tag: "@database" }, () => {
	test("opens the detail page for the first advertised role", async ({
		jobRoleListPage,
		jobRoleDetailPage,
	}) => {
		await jobRoleListPage.goto();
		await jobRoleListPage.openFirstJobRole();

		await expect(jobRoleDetailPage.detailCard).toBeVisible();
		await expect(jobRoleDetailPage.roleHeading).toBeVisible();
		await expect(jobRoleDetailPage.metaValue("Location")).toBeVisible();
		await expect(jobRoleDetailPage.overviewHeading).toBeVisible();
	});

	test("matches the role returned by the API", async ({
		jobRoleApi,
		jobRoleDetailPage,
	}) => {
		const role = await jobRoleApi.getFirstJobRole();
		expect(role).not.toBeNull();

		await jobRoleDetailPage.gotoRole(
			(role as NonNullable<typeof role>).jobRoleId,
		);

		await expect(jobRoleDetailPage.roleHeading).toHaveText(
			(role as NonNullable<typeof role>).roleName,
		);
	});

	test("shows a not found state for an unknown role", async ({
		jobRoleDetailPage,
	}) => {
		await jobRoleDetailPage.gotoRole(999999);

		await expect(jobRoleDetailPage.emptyState).toBeVisible();
		await expect(jobRoleDetailPage.emptyState).toContainText("Role not found");
	});

	test("navigates back to the list", async ({ jobRoleDetailPage }) => {
		await jobRoleDetailPage.gotoRole(1);
		await jobRoleDetailPage.backToList();

		await expect(jobRoleDetailPage.page).toHaveURL(/\/job-roles$/);
	});
});
