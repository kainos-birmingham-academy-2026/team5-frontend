const form = document.querySelector("[data-filter-form]");
const siteHeader = document.querySelector("[data-site-header]");
const navToggle = document.querySelector("[data-nav-toggle]");

const closeNavigation = () => {
  if (!siteHeader || !navToggle) return;

  siteHeader.dataset.menuOpen = "false";
  navToggle.setAttribute("aria-expanded", "false");
  const label = navToggle.querySelector(".ds-sr-only");
  if (label) label.textContent = "Open navigation";
};

if (siteHeader && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    siteHeader.dataset.menuOpen = String(!isOpen);
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    const label = navToggle.querySelector(".ds-sr-only");
    if (label) label.textContent = isOpen ? "Open navigation" : "Close navigation";
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
      navToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) closeNavigation();
  });
}

if (form) {
  const keywordInput = form.querySelector('[data-filter="keyword"]');
  const locationInput = form.querySelector('[data-filter="location"]');
  const cards = [...document.querySelectorAll(".job-card")];

  const applyFilters = () => {
    const keyword = (keywordInput?.value || "").trim().toLowerCase();
    const location = (locationInput?.value || "").trim().toLowerCase();

    cards.forEach((card) => {
      const role = card.getAttribute("data-role") || "";
      const city = card.getAttribute("data-location") || "";
      const keywordMatch = !keyword || role.includes(keyword);
      const locationMatch = !location || city.includes(location);
      card.hidden = !(keywordMatch && locationMatch);
    });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
}
