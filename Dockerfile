# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Templates and static assets are resolved from src/views at runtime.
COPY src/views ./src/views

# Winston writes file transports to ./logs, which must be writable by the node user.
RUN mkdir -p logs && chown -R node:node logs

USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
