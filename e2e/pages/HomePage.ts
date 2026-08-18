import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
	protected readonly path = "/";

	readonly heroHeading: Locator;
	readonly browseOpportunitiesButton: Locator;
	readonly featuredRolesHeading: Locator;
	readonly featuredJobCards: Locator;
	readonly emptyState: Locator;

	constructor(page: Page) {
		super(page);
		this.heroHeading = page.getByRole("heading", { level: 1 });
		this.browseOpportunitiesButton = page
			.locator(".hero")
			.getByRole("link", { name: "Browse opportunities" });
		this.featuredRolesHeading = page.getByRole("heading", {
			name: "Featured opportunities",
		});
		this.featuredJobCards = page.locator(".job-card");
		this.emptyState = page.locator(".empty-state");
	}

	async browseOpportunities(): Promise<void> {
		await this.browseOpportunitiesButton.click();
	}

	async featuredRoleCount(): Promise<number> {
		return this.featuredJobCards.count();
	}
}
