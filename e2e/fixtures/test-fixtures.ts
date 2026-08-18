import {
	type APIRequestContext,
	test as base,
	request,
} from "@playwright/test";
import { AuthApiClient } from "../api/AuthApiClient";
import { HealthApiClient } from "../api/HealthApiClient";
import { JobRoleApiClient } from "../api/JobRoleApiClient";
import {
	type EnvironmentConfig,
	getEnvironment,
	getTestUser,
} from "../config/environments";
import { HomePage } from "../pages/HomePage";
import { JobRoleDetailPage } from "../pages/JobRoleDetailPage";
import { JobRoleListPage } from "../pages/JobRoleListPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { uniqueEmail, validPassword } from "./test-data";

type WorkerFixtures = {
	env: EnvironmentConfig;
	apiContext: APIRequestContext;
};

type TestFixtures = {
	homePage: HomePage;
	jobRoleListPage: JobRoleListPage;
	jobRoleDetailPage: JobRoleDetailPage;
	loginPage: LoginPage;
	registerPage: RegisterPage;
	jobRoleApi: JobRoleApiClient;
	authApi: AuthApiClient;
	healthApi: HealthApiClient;
	testUser: { email: string; password: string };
	/** A brand new account created through the API; requires the database. */
	registeredUser: { email: string; password: string };
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
	env: [
		// biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature
		async ({}, use) => {
			await use(getEnvironment());
		},
		{ scope: "worker" },
	],

	apiContext: [
		async ({ env }, use) => {
			const context = await request.newContext({
				baseURL: env.apiBaseURL,
				extraHTTPHeaders: { "Content-Type": "application/json" },
			});
			await use(context);
			await context.dispose();
		},
		{ scope: "worker" },
	],

	jobRoleApi: async ({ apiContext, env }, use) => {
		await use(new JobRoleApiClient(apiContext, env.apiBaseURL));
	},

	authApi: async ({ apiContext, env }, use) => {
		await use(new AuthApiClient(apiContext, env.apiBaseURL));
	},

	healthApi: async ({ apiContext, env }, use) => {
		// Health lives on the frontend, not the backend API.
		await use(new HealthApiClient(apiContext, env.baseURL));
	},

	homePage: async ({ page }, use) => {
		await use(new HomePage(page));
	},

	jobRoleListPage: async ({ page }, use) => {
		await use(new JobRoleListPage(page));
	},

	jobRoleDetailPage: async ({ page }, use) => {
		await use(new JobRoleDetailPage(page));
	},

	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},

	registerPage: async ({ page }, use) => {
		await use(new RegisterPage(page));
	},

	// biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature
	testUser: async ({}, use) => {
		const user = getTestUser();
		test.skip(
			user === null,
			"Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated tests.",
		);
		await use(user as { email: string; password: string });
	},

	registeredUser: async ({ authApi }, use) => {
		const credentials = { email: uniqueEmail(), password: validPassword };
		const result = await authApi.register(credentials);

		if (!result.ok) {
			throw new Error(
				`Could not provision a test account (status ${result.status}): ${JSON.stringify(result.body)}`,
			);
		}

		await use(credentials);
	},
});

export { expect } from "@playwright/test";
