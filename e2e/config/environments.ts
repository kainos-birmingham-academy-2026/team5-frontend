import "dotenv/config";

export type EnvironmentName = "local" | "dev" | "staging";

export type EnvironmentConfig = {
	name: EnvironmentName;
	/** Frontend under test. */
	baseURL: string;
	/** Backend API used by the API clients. */
	apiBaseURL: string;
	/** Start the frontend with the Playwright webServer block. */
	startWebServer: boolean;
	/** Fail global setup when the API is unreachable. */
	requireApi: boolean;
	timeouts: {
		expect: number;
		action: number;
		navigation: number;
		test: number;
	};
	retries: number;
};

const environments: Record<EnvironmentName, EnvironmentConfig> = {
	local: {
		name: "local",
		baseURL: "http://localhost:4000",
		apiBaseURL: "http://localhost:3000",
		startWebServer: true,
		requireApi: false,
		timeouts: {
			expect: 5_000,
			action: 10_000,
			navigation: 15_000,
			test: 60_000,
		},
		retries: 0,
	},
	dev: {
		name: "dev",
		baseURL: "https://team5-frontend-dev.example.com",
		apiBaseURL: "https://team5-api-dev.example.com",
		startWebServer: false,
		requireApi: true,
		timeouts: {
			expect: 10_000,
			action: 15_000,
			navigation: 30_000,
			test: 90_000,
		},
		retries: 1,
	},
	staging: {
		name: "staging",
		baseURL: "https://team5-frontend-staging.example.com",
		apiBaseURL: "https://team5-api-staging.example.com",
		startWebServer: false,
		requireApi: true,
		timeouts: {
			expect: 10_000,
			action: 15_000,
			navigation: 30_000,
			test: 90_000,
		},
		retries: 2,
	},
};

const isEnvironmentName = (value: string): value is EnvironmentName =>
	value in environments;

export const getEnvironment = (): EnvironmentConfig => {
	const requested = (process.env.TEST_ENV ?? "local").toLowerCase();

	if (!isEnvironmentName(requested)) {
		throw new Error(
			`Unknown TEST_ENV "${requested}". Expected one of: ${Object.keys(environments).join(", ")}.`,
		);
	}

	const config = environments[requested];

	// Per-run overrides so pipelines can point at ephemeral deployments.
	return {
		...config,
		baseURL: process.env.BASE_URL ?? config.baseURL,
		apiBaseURL: process.env.API_BASE_URL ?? config.apiBaseURL,
	};
};

/** Credentials are supplied by the runner, never committed. */
export const getTestUser = (): { email: string; password: string } | null => {
	const email = process.env.TEST_USER_EMAIL;
	const password = process.env.TEST_USER_PASSWORD;

	return email && password ? { email, password } : null;
};
