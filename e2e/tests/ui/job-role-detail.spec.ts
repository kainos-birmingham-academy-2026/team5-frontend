import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Job role detail", { tag: "@database" }, () => {
	test("shows the full detail of a role from the API", async ({
		jobRoleApi,
		jobRoleDetailPage,
	}) => {
		const role = await jobRoleApi.getFirstJobRole();
		expect(role).not.toBeNull();
		const expected = role as NonNullable<typeof role>;

		await jobRoleDetailPage.gotoRole(expected.jobRoleId);

		await expect(jobRoleDetailPage.detailCard).toBeVisible();
		await expect(jobRoleDetailPage.roleHeading).toHaveText(expected.roleName);
		await expect(jobRoleDetailPage.metaValue("Location")).toHaveText(
			expected.location,
		);
		await expect(jobRoleDetailPage.metaValue("Status")).toHaveText(
			expected.status ?? "Unknown",
		);
		await expect(jobRoleDetailPage.statusBadge).toBeVisible();
		await expect(jobRoleDetailPage.overviewHeading).toBeVisible();
	});

	test("shows the role name in the breadcrumb trail", async ({
		jobRoleApi,
		jobRoleDetailPage,
	}) => {
		const role = await jobRoleApi.getFirstJobRole();
		const expected = role as NonNullable<typeof role>;

		await jobRoleDetailPage.gotoRole(expected.jobRoleId);

		await expect(jobRoleDetailPage.breadcrumbs).toBeVisible();
		await expect(jobRoleDetailPage.breadcrumbCurrent()).toHaveText(
			expected.roleName,
		);
	});

	test("opens a role from the list and returns to it", async ({
		jobRoleListPage,
		jobRoleDetailPage,
	}) => {
		await jobRoleListPage.goto();
		await jobRoleListPage.openFirstJobRole();

		await expect(jobRoleDetailPage.detailCard).toBeVisible();

		await jobRoleDetailPage.backToList();

		await expect(jobRoleDetailPage.page).toHaveURL(/\/job-roles$/);
		await expect(jobRoleListPage.heading).toBeVisible();
	});

	test("shows a not found state for an unknown role", async ({
		jobRoleDetailPage,
	}) => {
		const response = await jobRoleDetailPage.gotoRole(999999);

		expect(response?.status()).toBe(404);
		await expect(jobRoleDetailPage.emptyState).toBeVisible();
		await expect(jobRoleDetailPage.emptyState).toContainText("Role not found");
		await expect(jobRoleDetailPage.detailCard).toHaveCount(0);
	});

	test("rejects a non-numeric role id", async ({ jobRoleDetailPage }) => {
		const response = await jobRoleDetailPage.gotoRole("not-a-number");

		expect(response?.status()).toBe(400);
	});
});
