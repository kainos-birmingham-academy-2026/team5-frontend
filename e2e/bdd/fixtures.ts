import { type APIRequestContext, request } from "@playwright/test";
import { test as base, createBdd } from "playwright-bdd";
import { AuthApiClient } from "../api/AuthApiClient";
import { type EnvironmentConfig, getEnvironment } from "../config/environments";
import { World } from "./world";

type WorkerFixtures = {
	env: EnvironmentConfig;
	apiContext: APIRequestContext;
};

type TestFixtures = {
	authApi: AuthApiClient;
	world: World;
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

	authApi: async ({ apiContext, env }, use) => {
		await use(new AuthApiClient(apiContext, env.apiBaseURL));
	},

	world: async ({ page, authApi }, use) => {
		await use(new World(page, authApi));
	},
});

export const { Given, When, Then, Before, After } = createBdd(test, {
	worldFixture: "world",
});

export { expect } from "@playwright/test";
