import type { Page } from "@playwright/test";
import type { AuthApiClient } from "../api/AuthApiClient";
import { uniqueEmail, validPassword } from "../fixtures/test-data";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { JobRoleListPage } from "../pages/JobRoleListPage";

export type Credentials = { email: string; password: string };

/** Scenario-scoped state shared by the step definitions. */
export class World {
	readonly homePage: HomePage;
	readonly loginPage: LoginPage;
	readonly registerPage: RegisterPage;
	readonly jobRoleListPage: JobRoleListPage;

	private candidate?: Credentials;

	constructor(
		readonly page: Page,
		private readonly authApi: AuthApiClient,
	) {
		this.homePage = new HomePage(page);
		this.loginPage = new LoginPage(page);
		this.registerPage = new RegisterPage(page);
		this.jobRoleListPage = new JobRoleListPage(page);
	}

	get credentials(): Credentials {
		if (!this.candidate) {
			throw new Error(
				"No candidate credentials yet. Register or provision an account first.",
			);
		}
		return this.candidate;
	}

	newCandidate(): Credentials {
		this.candidate = { email: uniqueEmail(), password: validPassword };
		return this.candidate;
	}

	/** Creates the account through the API so sign in steps have something to use. */
	async provisionCandidate(): Promise<Credentials> {
		const credentials = this.newCandidate();
		const result = await this.authApi.register(credentials);

		if (!result.ok) {
			throw new Error(
				`Could not provision a test account (status ${result.status}): ${JSON.stringify(result.body)}`,
			);
		}

		return credentials;
	}
}
