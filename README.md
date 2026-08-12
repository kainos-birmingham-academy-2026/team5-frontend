# team5-frontend

- Created node project for frontend
- Installed express and nunjucks
- Added a linter using biome ("npm run lint" and "npm run lint:fix")
- Added unit testing using vitest ("npm run test", "npm run test:ui" and "npm run test:coverage")

## Automated Code Review

Pull requests targeting `main` or `master` run
`.github/workflows/code-review.yml`, which invokes the repository's
`/local-code-review` Copilot skill. The review appears on the workflow Summary
page, and the generated `code_reviews/` directory is also uploaded as an
artifact.

Before using the workflow, add a repository Actions secret named
`COPILOT_TOKEN`. Its fine-grained personal access token must have the
**Copilot Requests** permission. The standard `GITHUB_TOKEN` cannot make
Copilot requests.

The review does not run on `main` or `master` because it needs a feature branch
to compare with the default branch. A local commit does not start GitHub
Actions; the review starts when that commit is pushed.
Team5 Frontend — a Node.js/Express server with Nunjucks templating.

## Scripts

| Command | Description |
|---|---|
| `npm install` | Installs required dependencies |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled app from `dist/index.js` |
| `npm test` | Run all tests |
| `npm run test:ui` | Run UI tests only (`tests/ui.test.ts`) |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint the codebase with Biome |
| `npm run lint:fix` | Lint and auto-fix issues with Biome |
| `npm run format` | Format all files with Biome |

The review runs when a pull request is opened, reopened, marked ready, or
updated with new commits. Forked pull requests are skipped because GitHub does
not expose repository secrets to forks.
