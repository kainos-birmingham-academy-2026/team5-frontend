import { seedData } from "../../fixtures/test-data";
import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Job role API", { tag: "@database" }, () => {
	test("returns the first page with the requested page size", async ({
		jobRoleApi,
	}) => {
		const result = await jobRoleApi.getAll({ page: 1, pageSize: 5 });

		expect(result.status).toBe(200);
		expect(result.body.page).toBe(1);
		expect(result.body.pageSize).toBe(5);
		expect(result.body.items.length).toBeLessThanOrEqual(5);
		expect(result.body.totalItems).toBeGreaterThan(0);
		expect(result.body.totalPages).toBe(
			Math.ceil(result.body.totalItems / result.body.pageSize),
		);
	});

	test("returns different roles on the second page", async ({ jobRoleApi }) => {
		const first = await jobRoleApi.getAll({ page: 1, pageSize: 5 });
		test.skip(first.body.totalPages < 2, "Only one page of roles is seeded.");

		const second = await jobRoleApi.getAll({ page: 2, pageSize: 5 });
		const firstIds = first.body.items.map((role) => role.jobRoleId);
		const secondIds = second.body.items.map((role) => role.jobRoleId);

		expect(second.body.page).toBe(2);
		expect(secondIds.some((id) => firstIds.includes(id))).toBe(false);
	});

	test("returns filter options that cover the advertised roles", async ({
		jobRoleApi,
	}) => {
		const options = await jobRoleApi.getFilterOptions();

		expect(options.status).toBe(200);
		expect(options.body.capabilities.length).toBeGreaterThan(0);
		expect(options.body.bands.length).toBeGreaterThan(0);
		expect(options.body.statuses.length).toBeGreaterThan(0);

		const roles = await jobRoleApi.getAll({ page: 1, pageSize: 100 });
		for (const role of roles.body.items) {
			expect(options.body.capabilities).toContain(role.capabilityName);
			expect(options.body.bands).toContain(role.bandName);
			expect(options.body.statuses).toContain(role.status);
		}
	});

	test("filters by capability", async ({ jobRoleApi }) => {
		const capability = seedData.knownCapability;
		const result = await jobRoleApi.getAll({
			capability: [capability],
			pageSize: 100,
		});

		expect(result.status).toBe(200);
		expect(result.body.items.length).toBeGreaterThan(0);
		for (const role of result.body.items) {
			expect(role.capabilityName).toBe(capability);
		}
	});

	test("filters by role name", async ({ jobRoleApi }) => {
		const result = await jobRoleApi.getAll({
			roleName: seedData.knownRoleName,
			pageSize: 100,
		});

		expect(result.status).toBe(200);
		expect(result.body.items.length).toBeGreaterThan(0);
		for (const role of result.body.items) {
			expect(role.roleName.toLowerCase()).toContain(
				seedData.knownRoleName.toLowerCase(),
			);
		}
	});

	test("returns an empty page for an unmatched filter", async ({
		jobRoleApi,
	}) => {
		const result = await jobRoleApi.getAll({
			roleName: seedData.unmatchableRoleName,
		});

		expect(result.status).toBe(200);
		expect(result.body.items).toHaveLength(0);
		expect(result.body.totalItems).toBe(0);
	});

	test("returns a single job role by id", async ({ jobRoleApi }) => {
		const first = await jobRoleApi.getFirstJobRole();
		expect(first).not.toBeNull();

		const result = await jobRoleApi.getById(
			(first as NonNullable<typeof first>).jobRoleId,
		);

		expect(result.status).toBe(200);
		expect(result.body.jobRoleId).toBe(
			(first as NonNullable<typeof first>).jobRoleId,
		);
		expect(result.body.roleName).toBe(
			(first as NonNullable<typeof first>).roleName,
		);
	});

	test("returns 404 for an unknown job role id", async ({ jobRoleApi }) => {
		const result = await jobRoleApi.getById(999999);

		expect(result.status).toBe(404);
		expect(result.body.error).toBe("Job role not found");
	});

	test("returns 400 for a non-numeric job role id", async ({ jobRoleApi }) => {
		const result = await jobRoleApi.getById("not-a-number");

		expect(result.status).toBe(400);
		expect(result.body.error).toBe("Invalid ID provided");
	});
});
