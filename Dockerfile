# =============================================================================
# Dockerfile — Team 5 Frontend
# =============================================================================
# General idea:
# This file is a recipe Docker uses to package the Express + Nunjucks app
# into a runnable image. It uses TWO STAGES (two FROM lines):
#
#   1. "builder"  — install ALL dependencies (including TypeScript) and compile
#                   src/*.ts into JavaScript in dist/
#   2. final image — keep only production dependencies, compiled JS, and views
#
# Why two stages?
# The compiler and devDependencies are needed to BUILD the app, but not to RUN
# it. Copying only the useful output into a fresh image keeps the runtime image
# smaller and free of unused tools.
#
# After building:  docker build -t team5-frontend:1.0.0 .
# After running:   the container starts with `npm start` (node dist/index.js)
#                  and listens on port 4000.
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: builder
# Compile TypeScript. This stage is discarded after we copy dist/ out of it.
# -----------------------------------------------------------------------------

# FROM starts a new image. node:22-alpine is Node.js 22 on Alpine Linux
# (small official image). AS builder names this stage so stage 2 can copy from it.
FROM node:22-alpine AS builder

# WORKDIR sets the current directory inside the container to /app.
# Later COPY and RUN commands happen here. Docker creates /app if it is missing.
WORKDIR /app

# Copy ONLY the package manifests first (not the whole source tree).
# Docker caches layers: if these files have not changed, it reuses the next
# npm ci layer instead of reinstalling dependencies on every build.
COPY package.json package-lock.json ./

# npm ci installs the EXACT versions from package-lock.json.
# Prefer this over `npm install` in Docker because it is reproducible and
# fails if package.json and the lockfile are out of sync.
RUN npm ci

# TypeScript needs this config to compile (outDir: dist, rootDir: src).
COPY tsconfig.json ./

# Copy application source so tsc can compile it.
# This is a later COPY so changing source does not bust the npm ci cache.
COPY src ./src

# Run the project's build script (`tsc`). Output goes to /app/dist.
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: production / runtime image
# A clean Node image with only what is needed to start the server.
# This second FROM throws away the builder filesystem unless we COPY from it.
# -----------------------------------------------------------------------------

# Start from the same small Node base. This is the image that gets tagged
# (for example team5-frontend:1.0.0). It does not include TypeScript or tests.
FROM node:22-alpine

# Working directory again — each stage starts empty, so this must be set here too.
WORKDIR /app

# NODE_ENV=production tells Node libraries (and Express session cookies) that
# this is a production run. npm also skips optional/dev-oriented behaviour.
ENV NODE_ENV=production

# Copy manifests into THIS image so we can install runtime packages here.
# We do not reuse node_modules from the builder, because that install included
# devDependencies (TypeScript, Vitest, Playwright, etc.).
COPY package.json package-lock.json ./

# Install production dependencies only. --omit=dev skips devDependencies.
RUN npm ci --omit=dev

# Copy compiled JavaScript from the builder stage into /app/dist.
# --from=builder means "take files from the stage named builder", not from
# your laptop's current folder.
COPY --from=builder /app/dist ./dist

# Nunjucks templates and static assets are NOT compiled by tsc.
# The app loads them at runtime from process.cwd() + "src/views",
# so they must exist in the runtime image at that path.
COPY src/views ./src/views

# EXPOSE documents that the process listens on port 4000.
# It does NOT publish the port. You still need `docker run -p 4000:4000`.
EXPOSE 4000

# CMD is the default process that keeps the container running.
# Exec form (JSON array) runs npm directly, without a shell.
# `npm start` maps to `node dist/index.js` in package.json.
CMD ["npm", "start"]
