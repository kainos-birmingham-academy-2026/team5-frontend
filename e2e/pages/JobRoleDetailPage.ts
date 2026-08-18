import type { Locator, Page, Response } from "@playwright/test";
import { BasePage } from "./BasePage";

export class JobRoleDetailPage extends BasePage {
	protected readonly path = "/job-roles";

	readonly breadcrumbs: Locator;
	readonly backLink: Locator;
	readonly detailCard: Locator;
	readonly roleHeading: Locator;
	readonly statusBadge: Locator;
	readonly overviewHeading: Locator;
	readonly emptyState: Locator;

	constructor(page: Page) {
		super(page);
		this.breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
		this.backLink = page.getByRole("link", { name: "Back to opportunities" });
		this.detailCard = page.locator(".detail-card");
		this.roleHeading = this.detailCard.getByRole("heading", { level: 1 });
		this.statusBadge = this.detailCard.locator(".badge");
		this.overviewHeading = page.getByRole("heading", { name: "Role overview" });
		this.emptyState = page.locator(".empty-state");
	}

	async gotoRole(jobRoleId: number | string): Promise<Response | null> {
		return this.page.goto(`${this.path}/${jobRoleId}`);
	}

	/** Reads a value from the definition list by its term, e.g. "Location". */
	metaValue(term: string): Locator {
		return this.detailCard
			.locator(".meta-grid div")
			.filter({ has: this.page.getByText(term, { exact: true }) })
			.locator("dd");
	}

	async backToList(): Promise<void> {
		await this.backLink.click();
	}
}
