const passwordInput = document.querySelector<HTMLInputElement>(
	"[data-password-input]",
);
const checklist = document.querySelector<HTMLElement>("[data-password-rules]");

const rules: Record<string, (value: string) => boolean> = {
	length: (value) => value.length > 8,
	uppercase: (value) => /[A-Z]/.test(value),
	lowercase: (value) => /[a-z]/.test(value),
	special: (value) => /[^A-Za-z0-9]/.test(value),
};

if (passwordInput && checklist) {
	const items = Array.from(
		checklist.querySelectorAll<HTMLElement>("[data-rule]"),
	);

	const update = (): void => {
		const value = passwordInput.value;
		const touched = value.length > 0;
		checklist.dataset.touched = String(touched);

		for (const item of items) {
			const rule = item.dataset.rule;
			const isMet = rule ? Boolean(rules[rule]?.(value)) : false;
			item.classList.toggle("is-met", isMet);
			item.classList.toggle("is-unmet", touched && !isMet);
			item.setAttribute("aria-checked", String(isMet));
		}
	};

	passwordInput.addEventListener("input", update);
	update();
}
