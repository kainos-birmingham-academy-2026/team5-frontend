import { seedData } from "../../fixtures/test-data";
import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Job role list", { tag: "@database" }, () => {
	test.beforeEach(async ({ jobRoleListPage }) => {
		await jobRoleListPage.goto();
	});

	test("shows the vacancies section", async ({ jobRoleListPage }) => {
		await expect(jobRoleListPage.page).toHaveTitle(/Opportunities/);
		await expect(jobRoleListPage.heading).toBeVisible();
	});

	test("renders a card per advertised role", async ({ jobRoleListPage }) => {
		expect(await jobRoleListPage.jobCount()).toBeGreaterThan(0);

		const card = jobRoleListPage.jobCards.first();
		await expect(card).toBeVisible();
		await expect(jobRoleListPage.cardMeta(card, "Location")).not.toBeEmpty();
		await expect(jobRoleListPage.cardMeta(card, "Capability")).not.toBeEmpty();
		await expect(jobRoleListPage.cardMeta(card, "Band")).not.toBeEmpty();
		await expect(
			jobRoleListPage.cardMeta(card, "Closing date"),
		).not.toBeEmpty();
		await expect(jobRoleListPage.viewRoleLink()).toBeVisible();
	});

	test("matches the roles returned by the API", async ({
		jobRoleApi,
		jobRoleListPage,
	}) => {
		const result = await jobRoleApi.getAll({ page: 1, pageSize: 10 });

		expect(await jobRoleListPage.roleNames()).toEqual(
			result.body.items.map((role) => role.roleName),
		);
	});

	test("filters by role name and keeps the panel open", async ({
		jobRoleListPage,
	}) => {
		await jobRoleListPage.applyFilters({ roleName: seedData.knownRoleName });

		await expect(jobRoleListPage.page).toHaveURL(
			new RegExp(`roleName=${seedData.knownRoleName}`),
		);
		await expect(jobRoleListPage.filterPanel).toHaveAttribute("open", "");
		await expect(jobRoleListPage.roleNameInput).toHaveValue(
			seedData.knownRoleName,
		);

		for (const roleName of await jobRoleListPage.roleNames()) {
			expect(roleName.toLowerCase()).toContain(
				seedData.knownRoleName.toLowerCase(),
			);
		}
	});

	test("filters by capability", async ({ jobRoleListPage }) => {
		await jobRoleListPage.applyFilters({
			capability: [seedData.knownCapability],
		});

		await expect(
			jobRoleListPage.checkboxFor("capability", seedData.knownCapability),
		).toBeChecked();
		expect(await jobRoleListPage.jobCount()).toBeGreaterThan(0);

		const cards = await jobRoleListPage.jobCards.all();
		for (const card of cards) {
			await expect(jobRoleListPage.cardMeta(card, "Capability")).toHaveText(
				seedData.knownCapability,
			);
		}
	});

	test("filters by location", async ({ jobRoleApi, jobRoleListPage }) => {
		const role = await jobRoleApi.getFirstJobRole();
		expect(role).not.toBeNull();
		const location = (role as NonNullable<typeof role>).location;

		await jobRoleListPage.applyFilters({ location });

		expect(await jobRoleListPage.jobCount()).toBeGreaterThan(0);
		const cards = await jobRoleListPage.jobCards.all();
		for (const card of cards) {
			await expect(jobRoleListPage.cardMeta(card, "Location")).toHaveText(
				location,
			);
		}
	});

	test("shows an empty state when nothing matches", async ({
		jobRoleListPage,
	}) => {
		await jobRoleListPage.applyFilters({
			roleName: seedData.unmatchableRoleName,
		});

		await expect(jobRoleListPage.emptyState).toBeVisible();
		await expect(jobRoleListPage.emptyState).toContainText(
			"No job roles found",
		);
		expect(await jobRoleListPage.jobCount()).toBe(0);
	});

	test("clears filters", async ({ jobRoleListPage }) => {
		await jobRoleListPage.applyFilters({
			roleName: seedData.knownRoleName,
			capability: [seedData.knownCapability],
		});
		await jobRoleListPage.clearFilters();

		await expect(jobRoleListPage.page).toHaveURL(/\/job-roles$/);
		await expect(jobRoleListPage.roleNameInput).toHaveValue("");
		await expect(
			jobRoleListPage.checkboxFor("capability", seedData.knownCapability),
		).not.toBeChecked();
	});

	test("pages forwards and back through the results", async ({
		jobRoleApi,
		jobRoleListPage,
	}) => {
		const result = await jobRoleApi.getAll({ page: 1, pageSize: 10 });
		test.skip(result.body.totalPages < 2, "Only one page of roles is seeded.");

		await expect(jobRoleListPage.pageIndex).toHaveText(
			`Page 1 of ${result.body.totalPages}`,
		);
		await expect(jobRoleListPage.previousPageLink).toHaveCount(0);

		const firstPageRoles = await jobRoleListPage.roleNames();
		await jobRoleListPage.goToNextPage();

		await expect(jobRoleListPage.page).toHaveURL(/page=2/);
		await expect(jobRoleListPage.pageIndex).toHaveText(
			`Page 2 of ${result.body.totalPages}`,
		);
		expect(await jobRoleListPage.roleNames()).not.toEqual(firstPageRoles);

		await jobRoleListPage.goToPreviousPage();
		await expect(jobRoleListPage.pageIndex).toHaveText(
			`Page 1 of ${result.body.totalPages}`,
		);
	});

	test("keeps filters applied while paging", async ({ jobRoleListPage }) => {
		await jobRoleListPage.applyFilters({
			capability: [seedData.pagedCapability],
		});
		test.skip(
			(await jobRoleListPage.nextPageLink.count()) === 0,
			"Filtered results fit on a single page.",
		);

		await jobRoleListPage.goToNextPage();

		await expect(jobRoleListPage.page).toHaveURL(
			new RegExp(`capability=${seedData.pagedCapability}`),
		);
		await expect(
			jobRoleListPage.checkboxFor("capability", seedData.pagedCapability),
		).toBeChecked();
	});

	test("opens the detail page for a role", async ({
		jobRoleListPage,
		jobRoleDetailPage,
	}) => {
		const [firstRoleName] = await jobRoleListPage.roleNames();
		await jobRoleListPage.openJobRole(firstRoleName);

		await expect(jobRoleListPage.page).toHaveURL(/\/job-roles\/\d+$/);
		await expect(jobRoleDetailPage.roleHeading).toHaveText(firstRoleName);
	});
});
