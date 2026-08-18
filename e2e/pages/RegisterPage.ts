import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export type PasswordRule = "length" | "uppercase" | "lowercase" | "special";

export class RegisterPage extends BasePage {
	protected readonly path = "/register";

	readonly heading: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;
	readonly errorMessage: Locator;
	readonly passwordChecklist: Locator;
	readonly signInLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "Register", level: 1 });
		this.emailInput = page.locator("#register-email");
		this.passwordInput = page.locator("#register-password");
		this.submitButton = page.getByRole("button", { name: "Register" });
		this.errorMessage = page.locator(".form-error");
		this.passwordChecklist = page.locator("[data-password-rules]");
		this.signInLink = page.getByRole("link", { name: "Sign In" });
	}

	passwordRule(rule: PasswordRule): Locator {
		return this.passwordChecklist.locator(`[data-rule="${rule}"]`);
	}

	async register(email: string, password: string): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.submitButton.click();
	}
}
