import type { Locator, Page } from "@playwright/test";

export class FooterComponent {
	readonly root: Locator;
	readonly browseOpportunitiesLink: Locator;
	readonly contactEmailLink: Locator;

	constructor(page: Page) {
		this.root = page.locator(".site-footer");
		this.browseOpportunitiesLink = this.root.getByRole("link", {
			name: "Browse opportunities",
		});
		this.contactEmailLink = this.root.getByRole("link", {
			name: "careers@kainos.com",
		});
	}
}
