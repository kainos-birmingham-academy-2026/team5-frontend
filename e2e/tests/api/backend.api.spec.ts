import { uniqueEmail, validPassword } from "../../fixtures/test-data";
import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Backend API", { tag: "@database" }, () => {
	test("returns a paginated list of job roles", async ({ jobRoleApi }) => {
		const result = await jobRoleApi.getAll({ page: 1, pageSize: 5 });

		expect(result.status).toBe(200);
		expect(result.body.page).toBe(1);
		expect(result.body.items.length).toBeGreaterThan(0);
		expect(result.body.items.length).toBeLessThanOrEqual(5);
	});

	test("orders job roles by a requested column in both directions", async ({
		jobRoleApi,
	}) => {
		const ascending = await jobRoleApi.getAll({
			page: 1,
			pageSize: 10,
			sortBy: "roleName",
			sortOrder: "asc",
		});
		const descending = await jobRoleApi.getAll({
			page: 1,
			pageSize: 10,
			sortBy: "roleName",
			sortOrder: "desc",
		});

		expect(ascending.status).toBe(200);
		expect(descending.status).toBe(200);

		const ascendingNames = ascending.body.items.map((item) => item.roleName);
		const descendingNames = descending.body.items.map((item) => item.roleName);
		expect(ascendingNames).toEqual(
			[...ascendingNames].sort((a, b) => a.localeCompare(b)),
		);
		expect(descendingNames).toEqual(
			[...descendingNames].sort((a, b) => b.localeCompare(a)),
		);
	});

	test("rejects an unsupported sort column", async ({ jobRoleApi }) => {
		const result = await jobRoleApi.getAll({ sortBy: "salary" });

		expect(result.status).toBe(400);
	});

	test("returns a single job role by id", async ({ jobRoleApi }) => {
		const first = await jobRoleApi.getFirstJobRole();
		expect(first).not.toBeNull();

		const result = await jobRoleApi.getById(
			(first as NonNullable<typeof first>).jobRoleId,
		);

		expect(result.status).toBe(200);
		expect(result.body.roleName).toBe(
			(first as NonNullable<typeof first>).roleName,
		);
	});

	test("registers an account and signs it in", async ({ authApi }) => {
		const credentials = { email: uniqueEmail(), password: validPassword };

		const registration = await authApi.register(credentials);
		expect(registration.status).toBe(201);
		expect(registration.body.token).toBeTruthy();

		const login = await authApi.login(credentials);
		expect(login.status).toBe(200);
		expect(login.body.token).toBeTruthy();
	});

	test("rejects unknown credentials", async ({ authApi }) => {
		const result = await authApi.login({
			email: uniqueEmail("unknown"),
			password: validPassword,
		});

		expect(result.status).toBe(401);
	});
});
