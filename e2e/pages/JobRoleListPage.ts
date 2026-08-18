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
			await this.checkboxFor("capability", capability).check();
		}
		for (const band of filters.band ?? []) {
			await this.checkboxFor("band", band).check();
		}
		for (const status of filters.status ?? []) {
			await this.checkboxFor("status", status).check();
		}

		await this.applyFiltersButton.click();
	}

	checkboxFor(group: "capability" | "band" | "status", value: string): Locator {
		return this.page.locator(`input[name="${group}"][value="${value}"]`);
	}

	async openJobRole(roleName: string): Promise<void> {
		await this.jobCardByRoleName(roleName)
			.getByRole("link", { name: "View role" })
			.click();
	}

	async openFirstJobRole(): Promise<void> {
		await this.jobCards
			.first()
			.getByRole("link", { name: "View role" })
			.click();
	}

	async jobCount(): Promise<number> {
		return this.jobCards.count();
	}

	async goToNextPage(): Promise<void> {
		await this.nextPageLink.click();
	}
}
