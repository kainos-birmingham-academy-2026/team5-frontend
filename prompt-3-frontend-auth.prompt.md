---
name: frontend-auth
description: Implement JWT login and protected routes for this TypeScript + Express + Nunjucks app using express-session
---
# Task: Add JWT Login + Route Protection (Server-Rendered Express App)

Use this prompt when you want to add or regenerate authentication in this repository.

This project uses:
- TypeScript
- Express
- Nunjucks templates
- GOV.UK Frontend
- Axios for backend API calls
- `express-session` for auth state

Do not use browser `sessionStorage` or localStorage for auth tokens in this project.

---

## Objective

Implement a complete auth flow where:
1. User signs in on `/login`.
2. Frontend server calls backend login endpoint and gets a JWT.
3. JWT is stored in `req.session.jwtToken`.
4. Expense routes are protected by middleware.
5. Protected backend API requests include `Authorization: Bearer <jwt>`.
6. User can sign out via `/logout`.

---

## Expected Backend Contract

The backend login endpoint path is configurable using `AUTH_LOGIN_PATH`.

Request payload should support:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Token response may include one of:
- `token`
- `jwtToken`
- `accessToken`

On invalid credentials, backend returns 400 or 401.

---

## Required Implementation Plan

Make these changes in order.

### 1) Dependencies
- Ensure `express-session` is installed.
- Ensure `@types/express-session` is installed.

### 2) App middleware wiring (`src/app.ts`)
- Add `app.use(express.json())`.
- Configure `app.use(session({...}))`.
- Set `res.locals.isAuthenticated = Boolean(req.session.jwtToken)`.
- Mount `authRouter` and existing domain routers.

### 3) Session typing (`src/types/express-session.d.ts`)
- Augment `SessionData` with optional `jwtToken?: string`.

### 4) Auth API service (`src/services/authApiService.ts`)
- Add `login(username, password)`.
- Read endpoint from `AUTH_LOGIN_PATH` with a sensible default.
- Parse token from multiple possible keys (`token`, `jwtToken`, `accessToken`).
- Map backend errors to user-friendly messages.

### 5) Auth controller (`src/controllers/authController.ts`)
- `showLogin`: render login page and redirect authenticated users to `/expenses`.
- `login`: validate inputs, call auth service, save `req.session.jwtToken`, redirect.
- `logout`: destroy session, clear cookie, redirect to `/login`.

### 6) Auth router (`src/routes/authRouter.ts`)
- `GET /login`
- `POST /login`
- `GET /logout`

### 7) Route guard (`src/middleware/authMiddleware.ts`)
- `requireAuth` middleware should redirect unauthenticated users to `/login`.

### 8) Protect expense routes (`src/routes/expenseRouter.ts`)
- Keep `/` public.
- Apply `router.use(requireAuth)` once.
- Keep all protected `/expenses*` routes below that line.

### 9) Protected API calls (`src/services/expenseApiService.ts`)
- Update service methods to accept `token: string`.
- Add `Authorization: Bearer <token>` to request headers.
- Preserve existing error mapping.

### 10) Pass token from controller (`src/controllers/expenseController.ts`)
- Read token from session.
- Pass token to expense API service calls.
- Handle unauthorized errors by clearing session token and redirecting to `/login`.

### 11) Login page UI (`src/views/pages/login.njk`)
- Build page with GOV.UK components.
- Use two-thirds width layout (`govuk-grid-column-two-thirds`).
- Include error summary and server-rendered validation messaging.

### 12) Header auth navigation (`src/views/partials/header.njk`)
- Show `Sign in` when logged out.
- Show `Sign out` when logged in.

---

## Non-Functional Requirements

- Keep changes minimal and consistent with existing coding style.
- Reuse existing router/controller/service architecture.
- Do not break existing expense CRUD behavior.
- Add concise comments only where the logic is non-obvious.

---

## Environment Variables

Use or document these env vars:
- `SESSION_SECRET`
- `API_BASE_URL`
- `AUTH_LOGIN_PATH`
- `NODE_ENV`

---

## Verification Checklist

Run and verify:
1. `npm run build` passes.
2. Visiting `/expenses` while logged out redirects to `/login`.
3. Valid login redirects to `/expenses`.
4. Invalid login shows error message on login page.
5. `/logout` ends session and redirects to `/login`.
6. After logout, protected routes redirect to `/login` again.

---

## Deliverables

Return:
1. List of files changed.
2. Summary of behavior implemented.
3. Any required environment variables.
4. Build/test verification result.
