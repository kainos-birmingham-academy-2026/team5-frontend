import type { Locator, Page } from "@playwright/test";

export class HeaderComponent {
	readonly root: Locator;
	readonly brandLink: Locator;
	readonly navToggle: Locator;
	readonly homeLink: Locator;
	readonly opportunitiesLink: Locator;
	readonly signInLink: Locator;
	readonly signOutLink: Locator;

	constructor(page: Page) {
		this.root = page.locator("[data-site-header]");
		this.brandLink = this.root.getByLabel("Kainos careers home");
		this.navToggle = this.root.locator("[data-nav-toggle]");
		this.homeLink = this.root.getByRole("link", { name: "Home", exact: true });
		this.opportunitiesLink = this.root.getByRole("link", {
			name: "Opportunities",
		});
		this.signInLink = this.root.getByRole("link", { name: "Sign in" });
		this.signOutLink = this.root.getByRole("link", { name: "Sign out" });
	}

	async isAuthenticated(): Promise<boolean> {
		return this.signOutLink.isVisible();
	}

	/** Below 1024px the nav collapses behind the toggle. */
	async openNavigation(): Promise<void> {
		if (
			(await this.navToggle.isVisible()) &&
			(await this.navToggle.getAttribute("aria-expanded")) !== "true"
		) {
			await this.navToggle.click();
		}
	}

	async goToOpportunities(): Promise<void> {
		await this.openNavigation();
		await this.opportunitiesLink.click();
	}

	async signOut(): Promise<void> {
		await this.openNavigation();
		await this.signOutLink.click();
	}
}
