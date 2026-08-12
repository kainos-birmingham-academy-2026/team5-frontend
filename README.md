# Team 5 Frontend

Server-rendered Team 5 careers application built with Node.js, Express, and
Nunjucks. It consumes the API in the sibling
[team5-backend repository](https://github.com/kainos-birmingham-academy-2026/team5-backend).

## Run the Complete Application

Keep both repositories next to each other with these directory names:

```text
Group project/
├── team5-backend/
└── team5-frontend/
```

From inside either repository, run:

```bash
npm run dev:stack
```

Or, from the parent `Group project` workspace directory, run:

```bash
npm run dev:stack --prefix team5-backend
```

The command installs missing dependencies, starts the configured local Docker
PostgreSQL container when needed, prepares Prisma, seeds development data
without deleting unrelated records, and starts both servers. Logs are prefixed
with `[backend]`, `[frontend]`, `[database]`, or `[setup]` so their source is
clear.

- Frontend: `http://localhost:4000`
- Backend API: `http://localhost:3000`
- Backend health check: `http://localhost:3000/health`

Press Ctrl+C once to stop both Node services. For database configuration,
Docker behavior, Prisma commands, and API details, see the
[backend setup guide](https://github.com/kainos-birmingham-academy-2026/team5-backend#run-the-complete-application).

## Run the Frontend Only

The backend must already be running. The frontend uses
`http://localhost:3000` by default; set `API_BASE_URL` to override it.

```bash
npm install
npm run dev
```

Open `http://localhost:4000`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev:stack` | Prepare the database and run frontend and backend |
| `npm run dev` | Run only the frontend with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled frontend |
| `npm test` | Run all tests |
| `npm run test:ui` | Run UI tests only |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint with Biome |
| `npm run lint:fix` | Lint and apply safe fixes |
| `npm run format` | Format with Biome |

## Automated Code Review

Pull requests targeting `main` or `master` run
`.github/workflows/code-review.yml`, which invokes the repository's
`/local-code-review` Copilot skill. The review appears on the workflow Summary
page, and the generated `code_reviews/` directory is uploaded as an artifact.

Add a repository Actions secret named `COPILOT_TOKEN` before using the
workflow. Its fine-grained personal access token must have the **Copilot
Requests** permission; the standard `GITHUB_TOKEN` cannot make Copilot
requests. Forked pull requests are skipped because GitHub does not expose
repository secrets to forks.
