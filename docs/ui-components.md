# UI Elements Implementation Guide

This project now uses reusable Nunjucks UI elements inspired by the Kainos careers and corporate sites.

## Implemented Pages

- `/` renders `src/views/careers-home.html`
- `/job-roles` renders `src/views/job-role-list.html`
- `/job-roles/:id` renders `src/views/job-role-detail.html`

## Reusable UI Elements

Defined in `src/views/components/ui-macros.html`:

- `hero(...)`: hero banner with CTA buttons
- `badge(text, tone)`: status and metadata chip
- `filterBar()`: keyword/location filter shell
- `jobCard(job)`: reusable job listing card
- `paginationShell()`: pagination controls (future data pagination)
- `storyCard(...)`: content/news card for story sections
- `ctaBand(...)`: high-contrast signup CTA strip

## Nunjucks Commands/Tags To Use

Use these tags to compose new pages:

- `{% extends "layouts/base.html" %}`: inherit the shared layout
- `{% block title %}...{% endblock %}`: set page title
- `{% block content %}...{% endblock %}`: page body content
- `{% include "partials/header.html" %}` / `{% include "partials/footer.html" %}`: shared shell pieces
- `{% from "components/ui-macros.html" import hero, jobCard %}`: import reusable macros
- `{{ hero(...) }}` / `{{ jobCard(job) }}`: render macro elements
- `{% if %}`, `{% for %}`: conditional and list rendering

## Styling/Assets

- Global styles: `src/views/assets/styles/main.css`
- UI behavior hooks: `src/views/assets/scripts/jobs.js`
- Assets are served under `/assets` via Express static middleware.

## Commands

- `npm install`: install dependencies
- `npm run dev`: start local server with hot reload
- `npm run build`: compile TypeScript
- `npm start`: run compiled server
- `npm run lint`: lint project
- `npm run test`: run test suite

## Adding A New Future Page

1. Create a new template in `src/views/` and extend `layouts/base.html`.
2. Import only the macros you need from `components/ui-macros.html`.
3. Add route/controller method in `src/routes/JobRouter.ts` and `src/controllers/JobRoleController.ts`.
4. Reuse style tokens from `main.css` (`--brand-green`, `--ink-900`, etc.) for consistency.
