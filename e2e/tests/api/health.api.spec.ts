import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Frontend health", () => {
	test("reports UP with a timestamp", async ({ healthApi }) => {
		const result = await healthApi.check();

		expect(result.status).toBe(200);
		expect(result.body.status).toBe("UP");
		expect(Number.isNaN(Date.parse(result.body.time))).toBe(false);
	});
});
