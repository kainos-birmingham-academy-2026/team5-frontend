const siteHeader = document.querySelector("[data-site-header]");
const navToggle = document.querySelector("[data-nav-toggle]");

const closeNavigation = (): void => {
	if (!siteHeader || !navToggle) return;

	(siteHeader as HTMLElement).dataset.menuOpen = "false";
	(navToggle as HTMLElement).setAttribute("aria-expanded", "false");
	const label = (navToggle as HTMLElement).querySelector(".ds-sr-only");
	if (label) label.textContent = "Open navigation";
};

if (siteHeader && navToggle) {
	(navToggle as HTMLElement).addEventListener("click", () => {
		const isOpen =
			(navToggle as HTMLElement).getAttribute("aria-expanded") === "true";
		(siteHeader as HTMLElement).dataset.menuOpen = String(!isOpen);
		(navToggle as HTMLElement).setAttribute("aria-expanded", String(!isOpen));
		const label = (navToggle as HTMLElement).querySelector(".ds-sr-only");
		if (label)
			label.textContent = isOpen ? "Open navigation" : "Close navigation";
	});

	document.addEventListener("keydown", (event: KeyboardEvent) => {
		if (
			event.key === "Escape" &&
			(navToggle as HTMLElement).getAttribute("aria-expanded") === "true"
		) {
			closeNavigation();
			(navToggle as HTMLElement).focus();
		}
	});

	window.addEventListener("resize", () => {
		if (window.innerWidth >= 1024) closeNavigation();
	});
}
