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
