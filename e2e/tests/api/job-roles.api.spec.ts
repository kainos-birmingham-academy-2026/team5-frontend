import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Job role API", () => {
	test("frontend health endpoint reports UP", async ({ healthApi }) => {
		const result = await healthApi.check();

		expect(result.status).toBe(200);
		expect(result.body.status).toBe("UP");
	});

	test.describe("backend", () => {
		test.beforeEach(({ apiAvailable }) => {
			test.skip(!apiAvailable, "Backend API is not available.");
		});

		test("returns a paginated list of job roles", async ({ jobRoleApi }) => {
			const result = await jobRoleApi.getAll({ page: 1, pageSize: 5 });
			test.skip(!result.ok, `API unavailable (status ${result.status}).`);

			expect(result.body.page).toBe(1);
			expect(Array.isArray(result.body.items)).toBe(true);
			expect(result.body.items.length).toBeLessThanOrEqual(5);
		});

		test("returns filter options", async ({ jobRoleApi }) => {
			const result = await jobRoleApi.getFilterOptions();
			test.skip(!result.ok, `API unavailable (status ${result.status}).`);

			expect(Array.isArray(result.body.capabilities)).toBe(true);
			expect(Array.isArray(result.body.bands)).toBe(true);
			expect(Array.isArray(result.body.statuses)).toBe(true);
		});

		test("returns a single job role by id", async ({ jobRoleApi }) => {
			const first = await jobRoleApi.getFirstJobRole();
			test.skip(first === null, "No job roles available in this environment.");

			const result = await jobRoleApi.getById(
				(first as NonNullable<typeof first>).jobRoleId,
			);

			expect(result.ok).toBe(true);
			expect(result.body.roleName).toBe(
				(first as NonNullable<typeof first>).roleName,
			);
		});

		test("rejects an unknown job role id", async ({ jobRoleApi }) => {
			const result = await jobRoleApi.getById(999999);

			expect(result.ok).toBe(false);
			expect(result.status).toBeGreaterThanOrEqual(400);
		});
	});
});
