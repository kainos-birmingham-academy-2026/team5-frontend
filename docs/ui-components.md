# Kainos-Inspired UI Component System

## Section 1: Assumptions

- The public Kainos careers and corporate sites are visual and interaction references, not content sources.
- Current routes remain `/`, `/job-roles`, and `/job-roles/:id`; no controller or service contract changes are required.
- The system targets light mode, modern evergreen browsers, English content, and WCAG 2.2 AA.
- Montserrat is used as a legally available approximation of the references' geometric sans-serif typography.
- Motion is restrained and automatically removed when `prefers-reduced-motion: reduce` is active.
- The CSS budget is under 50 KB uncompressed, with no new JavaScript dependency.
- Licensed photography can be passed to the optional `hero(..., imageUrl)` and `mediaCard(...)` arguments later.
- CSS custom properties named as breakpoints document the scale; literal values are required in media queries because custom properties cannot control media conditions.

## Section 2: Clarification Questions

These decisions were confirmed before implementation.

| Question | Decision |
| --- | --- |
| Strict brand match or inspired adaptation? | Strict match to public visual patterns without copying proprietary content. |
| Is dark mode required? | No, light mode only. |
| What typography constraints apply? | Match the Kainos direction with legally available fonts. |
| How much animation should be used? | Match the restrained public-site motion and support reduced motion. |
| Which browsers are supported? | Latest two versions of Chrome, Edge, Firefox, and Safari. |
| Is localization required? | English only for the current release. |
| What accessibility target applies? | WCAG 2.2 AA. |
| What performance budget applies? | Lean default: CSS under 50 KB uncompressed, no new JS dependency, minimal font weights. |

## Section 3: Component Inventory Table

| Component | Pattern inferred from references | Current page use | Future page use |
| --- | --- | --- | --- |
| Skip link | Keyboard bypass to main content | All current pages | All pages |
| Global header | Sticky brand and primary actions | All current pages | All pages |
| Mobile navigation | Collapsible menu with Escape support | All current pages | All pages |
| Utility bar | Compact language, saved jobs, or contact links | Not rendered | Global corporate shell |
| Mega menu | Grouped services, products, industries, and careers | CSS/markup pattern ready | Corporate and content pages |
| Hero | Full-width dark/image-backed headline and CTAs | Home and job list | Campaign and landing pages |
| Page hero | Compact title and introduction band | Not rendered | Legal, investor, contact pages |
| Breadcrumbs | Hierarchical page context | Job detail | Corporate, legal, investor pages |
| Buttons | Primary, secondary, ghost, disabled states | All current pages | All pages |
| Editorial split section | Alternating image and copy | Not rendered | Culture, academy, sustainability |
| Pillar cards | Values and benefits summaries | Careers home | About and service pages |
| Content cards | Reusable text-led linked cards | Macro ready | Services and related content |
| Media cards | Image, title, summary, CTA | Macro ready | Insights, case studies, academy |
| Story cards | Careers article previews | Careers home | Insights and culture pages |
| Job search/filter bar | Keyword and location controls | Job list | Insights filters |
| Job card | Status, role metadata, detail link | Home and job list | Related roles |
| Job metadata | Location, capability, band, date | Job cards and job detail | Other structured detail pages |
| Pagination | Previous/current/next controls | Job list shell | Insights and search results |
| Job detail body | Long-form role description and actions | Job detail | Other vacancy templates |
| Related roles | Section wrapper and card grid | CSS ready | Job detail |
| Badge | Compact status/category label | Job cards and detail | Insights and event labels |
| CTA band | High-contrast message and action | Careers home | All campaign pages |
| Forms and fields | Label, hint, error, required states | Macro/CSS ready | Talent, contact, newsletter |
| Notice | Informational or status message | Macro ready | Forms and service status |
| Empty/error state | Recovery message and optional action | Current empty results | Search, 404, maintenance |
| Testimonial | Quote and attribution | Macro ready | Culture, service, case studies |
| Accordion | Native keyboard-accessible disclosure | Macro/CSS ready | FAQ and legal content |
| Tabs | Horizontal content switcher pattern | CSS ready | Investor and product pages |
| Download list | Document title and download action | CSS ready | Investor reports and policies |
| Data table | Responsive-ready financial/legal data | CSS ready | Investor and corporate pages |
| Cookie bar | Consent surface pattern | CSS ready | Production compliance shell |
| Sticky CTA | Persistent job/application action | CSS ready | Job detail and campaigns |
| Footer | Careers, company, social, legal metadata | All current pages | All pages |

## Section 4: `kainos-design-system.css` Content

The complete source of truth is `src/views/assets/styles/kainos-design-system.css`. It contains tokens, reset styles, utilities, every listed component, interaction states, mobile-first responsive rules, reduced-motion behavior, and print rules.

The project entry point contains only this import so future project-only overrides remain obvious:

```css
@import url("./kainos-design-system.css");
```

Use semantic token names rather than raw colors:

```css
.new-component {
	padding: var(--space-5);
	color: var(--color-ink-900);
	background: var(--color-surface);
	border-block-start: 4px solid var(--color-brand-500);
}
```

## Section 5: Component Markup and Macros

Import only the macros a view needs:

```njk
{% from "components/ui-macros.html" import hero, breadcrumbs, jobCard, contentCard, mediaCard, formField, notice, emptyState, testimonial, accordionItem, ctaBand %}
```

Hero with an optional licensed image:

```njk
{{ hero("Careers", "Make a meaningful impact", "Build useful technology with people who value your perspective.", "Browse roles", "/job-roles", "Meet our teams", "/culture", "/assets/images/careers-hero.webp") }}
```

Breadcrumbs:

```njk
{{ breadcrumbs([
	{ label: "Home", href: "/" },
	{ label: "Opportunities", href: "/job-roles" },
	{ label: jobRole.roleName }
]) }}
```

Cards and job results:

```njk
<div class="ds-grid-3">
	{{ contentCard("Our culture", "Discover how teams learn and grow together.", "/culture") }}
	{{ mediaCard("Graduate pathways", "Start with structured support.", "/graduates", imageUrl, "Graduates collaborating") }}
</div>

<div class="job-grid">
	{% for job in jobRoles %}
		{{ jobCard(job) }}
	{% endfor %}
</div>
```

Accessible forms and feedback:

```njk
<form class="ds-stack">
	{{ formField("email", "Email address", "email", true, "We will only use this for role alerts.") }}
	<button class="btn btn-primary" type="submit">Join talent community</button>
</form>

{{ notice("Applications saved", "You can return and continue later.") }}
{{ emptyState("No matching roles", "Change your filters or browse every opportunity.", "Clear filters", "/job-roles") }}
```

Native disclosure and testimonial:

```njk
<div class="accordion">
	{{ accordionItem("Can I request an adjustment?", "Yes. Contact the recruitment team at any stage.") }}
</div>

{{ testimonial("I had room to learn and contribute from the start.", "Example colleague", "Software engineer") }}
```

## Section 6: Integration Steps With Exact File Paths

### `src/views/layouts/base.html`

Load Montserrat, then `main.css`; retain the skip link and stable main landmark:

```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/styles/main.css" />
<a class="skip-link" href="#main-content">Skip to main content</a>
<main class="site-main" id="main-content" tabindex="-1">...</main>
```

### `src/views/partials/header.html`

Keep `data-site-header`, `data-nav-toggle`, and `data-site-nav`; `jobs.js` uses these hooks without coupling behavior to styling classes. Add `aria-current="page"` when route data becomes available.

### `src/views/partials/footer.html`

Add future legal links as new list items inside `.footer-links`. Keep headings in logical order and descriptive external link text.

### `src/views/components/ui-macros.html`

Add new components as macros when their markup repeats. Keep arguments content-oriented and avoid passing raw class strings unless a controlled variant is required.

### `src/views/assets/styles/main.css`

Keep the design-system import first. Add only application-specific overrides below it.

### `src/views/assets/scripts/jobs.js`

This owns the mobile menu and current client-side job filters. New interactive components should use `data-*` behavior hooks and update ARIA state.

### Suggested additional files

- `src/views/partials/utility-bar.html` for saved jobs, locale, and contact actions.
- `src/views/partials/cookie-banner.html` after consent requirements and persistence are defined.
- `src/views/components/icons.html` for an approved, reusable inline icon set.
- `src/views/assets/images/` for optimized, licensed AVIF/WebP assets with meaningful alternatives.

Run the project checks:

```sh
npm run build
npm run lint
npm run test
npm run dev
```

## Section 7: Future Component Roadmap

| Component | Rationale |
| --- | --- |
| Testimonial carousel | Culture and service pages use colleague/client stories; progressive enhancement should retain readable static quotes. |
| Case-study card | Corporate pages repeatedly connect outcomes, sectors, and services. |
| FAQ accordion | Supports recruitment, academy, service, and policy questions with native keyboard behavior. |
| Sticky application band | Keeps the primary job action available on long descriptions. |
| Newsletter signup | Supports insights and talent-community retention. |
| Search-empty state | Gives users a recovery path when filters produce no results. |
| Error and maintenance blocks | Provides consistent 404, 500, API failure, and planned outage messaging. |
| Cookie preferences dialog | Required before analytics or personalization is introduced. |
| Share menu | Job and insight pages need accessible share actions without exposing a long link row. |
| Video facade | Defers third-party players until activation, protecting performance and consent. |
| Awards/logo strip | Careers and corporate pages use proof points; logos need alt-text rules and responsive overflow. |
| Office/location card | Contact and role pages need consistent address, timezone, and map-link presentation. |
| Document archive filters | Investor pages need year, type, and report filtering around the download-list pattern. |

## Section 8: Risks and Tradeoffs

- Public reference sites can change. This system captures observed patterns as of August 2026 and should be reviewed during brand updates.
- Exact Kainos typefaces and logo artwork were not copied. Montserrat and the temporary letter mark avoid unlicensed assets but reduce pixel-level fidelity.
- Image-led heroes need licensed local photography before production; the optional image API prevents proprietary hotlinking.
- The current filter runs only in the browser and pagination is a disabled shell. Large result sets require API-backed filtering, result counts, and live-region updates.
- Mega-menu, tabs, cookie controls, carousels, and dialogs have CSS patterns but need scoped JavaScript and interaction tests before use.
- English-only delivery lowers current complexity but does not guarantee RTL behavior; avoid hard-coded widths if localization enters scope.
- Google Fonts adds an external request. Self-host Montserrat subsets if privacy rules or stricter performance budgets require it.
