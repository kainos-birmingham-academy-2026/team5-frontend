import type { JobRoleSortField } from "../../pages/JobRoleListPage";
import { expect, Given, Then, When } from "../fixtures";

Given("User is on job roles page", async function () {
    await this.jobRoleListPage.goto();
});

Then("job roles are shown", async function () {
    await expect(this.jobRoleListPage.heading).toBeVisible();
    expect(await this.jobRoleListPage.jobCount());
});

When("User clicks on a job role", async function () {
    await this.jobRoleListPage.viewRoleLink().click();
});

Then("job role detail page is shown", async function () {
    await expect(this.jobRoleDetailPage.detailCard).toBeVisible();
});

When(
    "User clicks the {string} column heading",
    async function (field: JobRoleSortField) {
        await this.jobRoleListPage.sortBy(field);
    },
);

Then(
    "the {string} column is ordered {string}",
    async function (field: JobRoleSortField, order: string) {
        expect(await this.jobRoleListPage.sortOrder(field)).toBe(order);
    },
);