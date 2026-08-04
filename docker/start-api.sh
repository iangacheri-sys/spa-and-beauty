#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Production startup script for the Beauty Booker API server.
# Runs Prisma migrations (idempotent/safe to run on every start) then
# launches the bundled server.
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "==> Running Prisma database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "==> Starting API server..."
exec node --enable-source-maps ./dist/index.mjs
