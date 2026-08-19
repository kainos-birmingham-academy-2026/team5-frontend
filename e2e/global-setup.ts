import fs from "node:fs/promises";
import { request } from "@playwright/test";
import { getEnvironment, getTestUser } from "./config/environments";
import {
	ARTIFACT_DIR,
	STORAGE_STATE,
	writeRunContext,
} from "./config/run-context";

const waitForService = async (
	url: string,
	timeoutMs: number,
): Promise<boolean> => {
	const context = await request.newContext({ ignoreHTTPSErrors: true });
	const deadline = Date.now() + timeoutMs;

	try {
		while (Date.now() < deadline) {
			try {
				const response = await context.get(url, { failOnStatusCode: false });
				if (response.status() < 500) return true;
			} catch {
				// Service not up yet.
			}
			await new Promise((resolve) => setTimeout(resolve, 1_000));
		}
		return false;
	} finally {
		await context.dispose();
	}
};

/** Signs in through the UI so downstream projects can reuse the session cookie. */
const createStorageState = async (
	baseURL: string,
	user: { email: string; password: string },
): Promise<boolean> => {
	const { chromium } = await import("@playwright/test");
	const browser = await chromium.launch();
	const context = await browser.newContext({ baseURL });
	const page = await context.newPage();

	try {
		await page.goto("/login");
		await page.locator("#login-email").fill(user.email);
		await page.locator("#login-password").fill(user.password);
		await page.getByRole("button", { name: "Sign in" }).click();
		await page.waitForLoadState("networkidle");

		if (await page.locator(".form-error").isVisible()) {
			return false;
		}

		await context.storageState({ path: STORAGE_STATE });
		return true;
	} catch {
		return false;
	} finally {
		await context.close();
		await browser.close();
	}
};

export default async function globalSetup(): Promise<void> {
	const env = getEnvironment();
	const startedAt = new Date().toISOString();

	await fs.mkdir(ARTIFACT_DIR, { recursive: true });

	console.log(`[global-setup] environment: ${env.name}`);
	console.log(`[global-setup] frontend:    ${env.baseURL}`);
	console.log(`[global-setup] api:         ${env.apiBaseURL}`);

	const frontendUp = await waitForService(
		`${env.baseURL}/health`,
		env.timeouts.navigation,
	);
	if (!frontendUp) {
		throw new Error(
			`Frontend is not reachable at ${env.baseURL}. Start it with "npm run dev" or set BASE_URL.`,
		);
	}

	const apiUp = await waitForService(`${env.apiBaseURL}/job-roles`, 10_000);
	if (!apiUp && env.requireApi) {
		throw new Error(`API is not reachable at ${env.apiBaseURL}.`);
	}
	if (!apiUp) {
		console.warn(
			`[global-setup] API not reachable at ${env.apiBaseURL}; API-dependent tests may be skipped.`,
		);
	}

	const user = getTestUser();
	let authenticated = false;
	if (user && apiUp) {
		authenticated = await createStorageState(env.baseURL, user);
		console.log(
			authenticated
				? `[global-setup] storage state saved to ${STORAGE_STATE}`
				: "[global-setup] could not authenticate the test user; continuing unauthenticated.",
		);
	}

	writeRunContext({
		environment: env.name,
		startedAt,
		apiUp,
		authenticated,
	});
}
