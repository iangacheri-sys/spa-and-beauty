# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy workspace manifests and lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @workspace/api-server

# Copy source code
COPY artifacts/api-server ./artifacts/api-server

WORKDIR /app/artifacts/api-server

# Generate Prisma client
RUN pnpm exec prisma generate

# Build the server
RUN pnpm run build

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install pnpm
RUN npm install -g pnpm@latest

# Copy only what we need
COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/api-server/package.json ./
COPY --from=builder /app/artifacts/api-server/prisma ./prisma

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile && pnpm exec prisma generate

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
