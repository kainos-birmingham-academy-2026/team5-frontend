import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export type JobRoleFilters = {
	roleName?: string;
	location?: string;
	closingDate?: string;
	capability?: string[];
	band?: string[];
	status?: string[];
};

export class JobRoleListPage extends BasePage {
	protected readonly path = "/job-roles";

	readonly heading: Locator;
	readonly filterPanel: Locator;
	readonly filterPanelSummary: Locator;
	readonly roleNameInput: Locator;
	readonly locationInput: Locator;
	readonly closingDateInput: Locator;
	readonly applyFiltersButton: Locator;
	readonly clearFiltersLink: Locator;
	readonly jobCards: Locator;
	readonly emptyState: Locator;
	readonly pagination: Locator;
	readonly pageIndex: Locator;
	readonly nextPageLink: Locator;
	readonly previousPageLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "Current vacancies" });
		this.filterPanel = page.locator(".filter-panel");
		this.filterPanelSummary = this.filterPanel.locator("summary");
		this.roleNameInput = page.locator('input[name="roleName"]');
		this.locationInput = page.locator('input[name="location"]');
		this.closingDateInput = page.locator('input[name="closingDate"]');
		this.applyFiltersButton = page.getByRole("button", {
			name: "Apply filters",
		});
		this.clearFiltersLink = page.getByRole("link", { name: "Clear filters" });
		this.jobCards = page.locator(".job-card");
		this.emptyState = page.locator(".empty-state");
		this.pagination = page.getByRole("navigation", { name: "Pagination" });
		this.pageIndex = this.pagination.locator(".page-index");
		this.nextPageLink = this.pagination.getByRole("link", { name: "Next" });
		this.previousPageLink = this.pagination.getByRole("link", {
			name: "Previous",
		});
	}

	jobCardByRoleName(roleName: string): Locator {
		return this.jobCards.filter({ hasText: roleName }).first();
	}

	viewRoleLink(roleName?: string): Locator {
		const card = roleName
			? this.jobCardByRoleName(roleName)
			: this.jobCards.first();
		return card.getByRole("link", { name: "View role" });
	}

	async openFilterPanel(): Promise<void> {
		if (
			!(await this.filterPanel.evaluate(
				(el) => (el as HTMLDetailsElement).open,
			))
		) {
			await this.filterPanelSummary.click();
		}
	}

	async applyFilters(filters: JobRoleFilters): Promise<void> {
		await this.openFilterPanel();

		if (filters.roleName !== undefined) {
			await this.roleNameInput.fill(filters.roleName);
		}
		if (filters.location !== undefined) {
			await this.locationInput.fill(filters.location);
		}
		if (filters.closingDate !== undefined) {
			await this.closingDateInput.fill(filters.closingDate);
		}
		for (const capability of filters.capability ?? []) {
			await this.selectOption("capability", capability);
		}
		for (const band of filters.band ?? []) {
			await this.selectOption("band", band);
		}
		for (const status of filters.status ?? []) {
			await this.selectOption("status", status);
		}

		await this.applyFiltersButton.click();
	}

	checkboxFor(group: "capability" | "band" | "status", value: string): Locator {
		return this.page.locator(`input[name="${group}"][value="${value}"]`);
	}

	/** The checkboxes are visually hidden behind pill labels, so toggle by keyboard. */
	async selectOption(
		group: "capability" | "band" | "status",
		value: string,
	): Promise<void> {
		const checkbox = this.checkboxFor(group, value);
		if (await checkbox.isChecked()) return;

		await checkbox.focus();
		await this.page.keyboard.press("Space");
	}

	async clearFilters(): Promise<void> {
		await this.clearFiltersLink.click();
	}

	async openJobRole(roleName: string): Promise<void> {
		await this.viewRoleLink(roleName).click();
	}

	async openFirstJobRole(): Promise<void> {
		await this.viewRoleLink().click();
	}

	async jobCount(): Promise<number> {
		return this.jobCards.count();
	}

	async roleNames(): Promise<string[]> {
		return this.jobCards.locator("h3").allInnerTexts();
	}

	/** Reads a labelled value from a card, e.g. cardMeta(card, "Location"). */
	cardMeta(card: Locator, term: string): Locator {
		return card
			.locator(".meta-grid div")
			.filter({ has: this.page.getByText(term, { exact: true }) })
			.locator("dd");
	}

	async goToNextPage(): Promise<void> {
		await this.nextPageLink.click();
	}

	async goToPreviousPage(): Promise<void> {
		await this.previousPageLink.click();
	}
}
