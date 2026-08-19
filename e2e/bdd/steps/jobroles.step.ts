import { expect, Given, Then, When } from "../fixtures";

Given("User is on job roles page", async function () {
    await this.jobRoleListPage.goto();
});

Then("job roles are shown", async function () {
    await expect(this.jobRoleListPage.heading).toBeVisible();
    expect(await this.jobRoleListPage.jobCount());
});