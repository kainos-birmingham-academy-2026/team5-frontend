import type { Locator, Page, Response } from "@playwright/test";
import { FooterComponent } from "./components/FooterComponent";
import { HeaderComponent } from "./components/HeaderComponent";

export abstract class BasePage {
	/** Route relative to the environment baseURL. */
	protected abstract readonly path: string;

	readonly header: HeaderComponent;
	readonly footer: FooterComponent;
	readonly skipLink: Locator;
	readonly successToast: Locator;

	constructor(readonly page: Page) {
		this.header = new HeaderComponent(page);
		this.footer = new FooterComponent(page);
		this.skipLink = page.getByRole("link", { name: "Skip to main content" });
		this.successToast = page.locator(".toast-success");
	}

	async goto(
		query: Record<string, string | string[]> = {},
	): Promise<Response | null> {
		return this.page.goto(this.buildUrl(query));
	}

	async title(): Promise<string> {
		return this.page.title();
	}

	protected buildUrl(query: Record<string, string | string[]>): string {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(query)) {
			for (const item of Array.isArray(value) ? value : [value]) {
				params.append(key, item);
			}
		}
		const search = params.toString();
		return search ? `${this.path}?${search}` : this.path;
	}
}
