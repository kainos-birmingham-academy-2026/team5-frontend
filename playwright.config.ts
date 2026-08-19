import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import { getEnvironment } from "./e2e/config/environments";

const env = getEnvironment();

const bddTestDir = defineBddConfig({
	features: "e2e/bdd/features/**/*.feature",
	steps: ["e2e/bdd/fixtures.ts", "e2e/bdd/steps/**/*.ts"],
	outputDir: ".features-gen",
});

export default defineConfig({
	testDir: "./e2e/tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? env.retries : 0,
	workers: process.env.CI ? 1 : undefined,
	timeout: env.timeouts.test,
	expect: { timeout: env.timeouts.expect },
	globalSetup: "./e2e/global-setup.ts",
	globalTeardown: "./e2e/global-teardown.ts",
	reporter: [
		["list"],
		["html", { open: "never" }],
		["junit", { outputFile: "playwright-report/results.xml" }],
	],
	use: {
		baseURL: env.baseURL,
		actionTimeout: env.timeouts.action,
		navigationTimeout: env.timeouts.navigation,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},

	projects: [
		{
			name: "api",
			testDir: "./e2e/tests/api",
		},
		{
			name: "chromium",
			testDir: "./e2e/tests/ui",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "bdd",
			testDir: bddTestDir,
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: env.startWebServer
		? {
				command: "npm run dev",
				url: `${env.baseURL}/health`,
				reuseExistingServer: !process.env.CI,
				timeout: 60_000,
				stdout: "ignore",
				stderr: "pipe",
			}
		: undefined,
});
