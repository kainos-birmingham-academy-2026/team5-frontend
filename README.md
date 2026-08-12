# team5-frontend

- Created node project for frontend
- Installed express and nunjucks
- Added a linter using biome ("npm run lint" and "npm run lint:fix")
- Added unit testing using vitest ("npm run test", "npm run test:ui" and "npm run test:coverage")

## Automated Code Review

Feature-branch pushes run `.github/workflows/code-review.yml`, which invokes the
repository's `/local-code-review` Copilot skill and uploads the generated
`code_reviews/` directory as a workflow artifact.

Before using the workflow, add a repository Actions secret named
`COPILOT_TOKEN`. Its fine-grained personal access token must have the
**Copilot Requests** permission. The standard `GITHUB_TOKEN` cannot make
Copilot requests.

The review does not run on `main` or `master` because it needs a feature branch
to compare with the default branch. A local commit does not start GitHub
Actions; the review starts when that commit is pushed.