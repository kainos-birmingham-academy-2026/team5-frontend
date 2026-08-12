const form = document.querySelector("[data-filter-form]");
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

if (form) {
	const keywordInput = (form as HTMLFormElement).querySelector(
		'[data-filter="keyword"]',
	) as HTMLInputElement | null;
	const locationInput = (form as HTMLFormElement).querySelector(
		'[data-filter="location"]',
	) as HTMLInputElement | null;
	const cards: HTMLElement[] = [
		...(document.querySelectorAll(".job-card") as NodeListOf<HTMLElement>),
	];

	const applyFilters = (): void => {
		const keyword = (keywordInput?.value || "").trim().toLowerCase();
		const location = (locationInput?.value || "").trim().toLowerCase();

		cards.forEach((card) => {
			const role = card.getAttribute("data-role") || "";
			const city = card.getAttribute("data-location") || "";
			const keywordMatch = !keyword || role.includes(keyword);
			const locationMatch = !location || city.includes(location);
			(card as any).hidden = !(keywordMatch && locationMatch);
		});
	};

	(form as HTMLFormElement).addEventListener("submit", (event: Event) => {
		event.preventDefault();
		applyFilters();
	});
}
