---
name: styling
description: Use this prompt to generate reusable Kainos-inspired UI components, style tokens, and implementation docs for current and future pages.
---

You are a senior frontend design-system engineer.

Task:
Analyze the websites below and create a reusable UI component system for this project. Make this as an extention of the kainos website.

Reference websites:
- https://careers.kainos.com/gb/en

Project context:
- We already have pages/views for careers home, job list, and job detail.
- We want components that work for these pages now and can be reused for future pages.

Important constraints:
- Recreate the style direction and UX patterns, but do not copy proprietary content verbatim.
- Use semantic HTML and accessible components (ARIA where needed, proper heading order, focus states, keyboard navigation support).
- Output must be mobile-first and responsive.

Deliverables (required):
1. Component inventory and usage map
- List all components found/inferred from the reference sites (for example: global header, nav menu, mega menu pattern, hero sections, CTA blocks, cards, breadcrumbs, filters, pagination, job metadata block, related roles section, footer, social links, and utility bars).
- Mark each as:
	- Current page use
	- Future page use

2. Reusable style file (mandatory)
- Create one reusable style file for the whole component system.
- Name it: `src/views/assets/styles/kainos-design-system.css`
- Include:
	- Design tokens via CSS variables (colors, spacing scale, radius, shadows, typography scale, z-index, breakpoints)
	- Base/reset layer
	- Utility classes (layout, spacing, text, visibility)
	- Component-level class blocks for all listed components
	- States (hover, active, focus-visible, disabled)
	- Responsive behavior across breakpoints

3. Reusable component markup/macros
- Provide the HTML structures and/or Nunjucks macro patterns needed for each component.
- Prioritize compatibility with our existing views and partials.
- Keep naming conventions consistent and scalable.

4. Implementation guide
- Provide a file-by-file implementation plan for integrating into:
	- `src/views/layouts/base.html`
	- `src/views/partials/header.html`
	- `src/views/partials/footer.html`
	- `src/views/components/ui-macros.html`
	- `src/views/assets/styles/main.css`
	- and any additional suggested files
- Include the exact commands/tags/macros/import snippets needed.

5. Future-ready component list
- Add a "future components" section with elements not yet on current pages but likely needed (for example: testimonial strip, case-study cards, FAQ accordion, sticky CTA band, newsletter signup, search-empty state, error/maintenance blocks).
- Include short rationale for each.

6. Clarification questions (required)
- Ask concise clarification questions before finalizing implementation.
- Minimum 8 questions covering:
	- Brand strictness vs inspired adaptation
	- Dark mode need
	- Typography constraints
	- Animation/motion preferences
	- Browser support targets
	- Localization requirements
	- Accessibility target level (AA/AAA)
	- Performance budget

Output format:
- Section 1: Assumptions
- Section 2: Clarification questions
- Section 3: Component inventory table
- Section 4: `kainos-design-system.css` content
- Section 5: Component markup/macros
- Section 6: Integration steps with exact file paths
- Section 7: Future component roadmap
- Section 8: Risks and tradeoffs

Success criteria:
- The design system can be dropped into our existing project and reused consistently.
- Styles are centralized in one reusable file and easy to extend.
- Components are documented with implementation-ready examples.

