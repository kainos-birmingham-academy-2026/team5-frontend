import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Playwright owns e2e/**; vitest only runs the unit test suite.
		include: ["tests/**/*.test.ts"],
		exclude: ["node_modules", "dist", "e2e"],
	},
});
