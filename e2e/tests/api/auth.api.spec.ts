import { invalidCredentials } from "../../fixtures/test-data";
import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Auth API", () => {
	test.beforeEach(({ apiAvailable }) => {
		test.skip(!apiAvailable, "Backend API is not available.");
	});

	test("rejects unknown credentials", async ({ authApi }) => {
		const result = await authApi.login(invalidCredentials);

		expect(result.ok).toBe(false);
		expect(result.status).toBeGreaterThanOrEqual(400);
	});

	test("issues a token for the configured test user", async ({
		authApi,
		testUser,
	}) => {
		const result = await authApi.login(testUser);

		expect(result.ok).toBe(true);
		expect(result.body.token).toBeTruthy();
	});
});
