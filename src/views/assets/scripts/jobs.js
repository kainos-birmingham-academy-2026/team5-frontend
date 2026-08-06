const form = document.querySelector("[data-filter-form]");

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
