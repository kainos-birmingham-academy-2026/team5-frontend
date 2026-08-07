import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const viewPath = (...segments: string[]) =>
	join(process.cwd(), "src", "views", ...segments);

const readView = (...segments: string[]) =>
	readFileSync(viewPath(...segments), "utf8");

describe("Kainos design system", () => {
	it("is the single stylesheet imported by the project entry point", () => {
		const mainCss = readView("assets", "styles", "main.css");
		expect(mainCss.trim()).toBe(
			'@import url("./kainos-design-system.css");',
		);
	});

	it("defines core tokens, utilities, states, and responsive behavior", () => {
		const designSystem = readView(
			"assets",
			"styles",
			"kainos-design-system.css",
		);

		expect(designSystem).toContain("--color-brand-500:");
		expect(designSystem).toContain("--space-5:");
		expect(designSystem).toContain(".ds-sr-only");
		expect(designSystem).toContain(":focus-visible");
		expect(designSystem).toContain("@media (min-width: 48rem)");
		expect(designSystem).toContain("@media (prefers-reduced-motion: reduce)");
	});
});

describe("shared accessibility contracts", () => {
	it("connects the skip link to the main landmark", () => {
		const layout = readView("layouts", "base.html");
		expect(layout).toContain('href="#main-content"');
		expect(layout).toContain('id="main-content"');
	});

	it("connects the mobile navigation toggle to its controlled navigation", () => {
		const header = readView("partials", "header.html");
		expect(header).toContain('aria-expanded="false"');
		expect(header).toContain('aria-controls="primary-navigation"');
		expect(header).toContain('id="primary-navigation"');
	});

	it("uses a description list for job metadata", () => {
		const detail = readView("job-role-detail.html");
		expect(detail).toContain('<dl class="meta-grid">');
		expect(detail).toContain("</dl>");
	});
});
