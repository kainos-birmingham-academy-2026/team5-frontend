import type { Locator, Page, Response } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
	protected readonly path = "/login";

	readonly heading: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;
	readonly errorMessage: Locator;
	readonly registerLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "Welcome back" });
		this.emailInput = page.locator("#login-email");
		this.passwordInput = page.locator("#login-password");
		this.submitButton = page.getByRole("button", { name: "Sign in" });
		this.errorMessage = page.locator(".form-error");
		this.registerLink = page.getByRole("link", { name: "create an account" });
	}

	async login(email: string, password: string): Promise<Response> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		const [response] = await Promise.all([
			this.page.waitForResponse(
				(res) =>
					res.request().method() === "POST" &&
					new URL(res.url()).pathname === "/login",
			),
			this.submitButton.click(),
		]);
		return response;
	}

	async goToRegister(): Promise<void> {
		await this.registerLink.click();
	}
}
