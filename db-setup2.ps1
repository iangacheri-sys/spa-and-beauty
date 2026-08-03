$env:NODE_ENV = "development"
$env:PORT = "5000"
$env:DATABASE_URL = "postgresql://beautybooker:beautybooker_dev@localhost:5432/beautybooker"
$env:JWT_SECRET = "dev-only-secret-key-minimum-32-characters-for-local-development"
cd artifacts/api-server
npx prisma db push --accept-data-loss
pnpm dlx tsx prisma/seed.ts
