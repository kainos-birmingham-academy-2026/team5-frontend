import type { Locator, Page } from "@playwright/test";

/** Matches the 64rem breakpoint where the nav collapses behind the toggle. */
const COLLAPSE_BREAKPOINT = 1024;

export class HeaderComponent {
	readonly root: Locator;
	readonly brandLink: Locator;
	readonly navToggle: Locator;
	readonly homeLink: Locator;
	readonly opportunitiesLink: Locator;
	readonly signInLink: Locator;
	readonly signOutLink: Locator;

	constructor(private readonly page: Page) {
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

	async isNavigationOpen(): Promise<boolean> {
		return (await this.navToggle.getAttribute("aria-expanded")) === "true";
	}

	isCollapsed(): boolean {
		return (
			(this.page.viewportSize()?.width ?? COLLAPSE_BREAKPOINT) <
			COLLAPSE_BREAKPOINT
		);
	}

	async openNavigation(): Promise<void> {
		if (!this.isCollapsed()) return;
		if (await this.isNavigationOpen()) return;

		await this.navToggle.click();
	}

	async closeNavigation(): Promise<void> {
		if (!this.isCollapsed()) return;
		if (!(await this.isNavigationOpen())) return;

		await this.navToggle.click();
	}

	async goToHome(): Promise<void> {
		await this.clickNavLink(this.homeLink);
	}

	async goToOpportunities(): Promise<void> {
		await this.clickNavLink(this.opportunitiesLink);
	}

	async goToSignIn(): Promise<void> {
		await this.clickNavLink(this.signInLink);
	}

	async signOut(): Promise<void> {
		await this.clickNavLink(this.signOutLink);
	}

	/** Reveals the link first so the same call works either side of the mobile breakpoint. */
	private async clickNavLink(link: Locator): Promise<void> {
		await this.openNavigation();
		await link.click();
	}
}
