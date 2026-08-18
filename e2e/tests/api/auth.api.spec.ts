import {
	invalidCredentials,
	uniqueEmail,
	validPassword,
	weakPasswords,
} from "../../fixtures/test-data";
import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Auth API", { tag: "@database" }, () => {
	test("registers a new account and returns a token", async ({ authApi }) => {
		const email = uniqueEmail();
		const result = await authApi.register({ email, password: validPassword });

		expect(result.status).toBe(201);
		expect(result.body.user.email).toBe(email);
		expect(result.body.token).toBeTruthy();
	});

	test("logs in with a freshly registered account", async ({
		authApi,
		registeredUser,
	}) => {
		const result = await authApi.login(registeredUser);

		expect(result.status).toBe(200);
		expect(result.body.user.email).toBe(registeredUser.email);
		expect(result.body.token).toBeTruthy();
	});

	test("rejects a duplicate email", async ({ authApi, registeredUser }) => {
		const result = await authApi.register(registeredUser);

		expect(result.status).toBe(400);
		expect(result.body.error).toBe("User with this email already exists");
	});

	test("rejects a weak password", async ({ authApi }) => {
		const result = await authApi.register({
			email: uniqueEmail(),
			password: weakPasswords.tooShort,
		});

		expect(result.status).toBe(400);
		expect(result.body.token).toBeFalsy();
	});

	test("rejects unknown credentials", async ({ authApi }) => {
		const result = await authApi.login(invalidCredentials);

		expect(result.status).toBe(401);
		expect(result.body.error).toBe("Invalid email or password");
	});

	test("rejects the wrong password for a known account", async ({
		authApi,
		registeredUser,
	}) => {
		const result = await authApi.login({
			email: registeredUser.email,
			password: `${validPassword}-wrong`,
		});

		expect(result.status).toBe(401);
		expect(result.body.token).toBeFalsy();
	});

	test("rejects a missing password", async ({ authApi }) => {
		const result = await authApi.login({ email: uniqueEmail(), password: "" });

		expect(result.status).toBeGreaterThanOrEqual(400);
		expect(result.body.token).toBeFalsy();
	});
});
