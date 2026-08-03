$env:NODE_ENV = "development"
$env:PORT = "5000"
$env:DATABASE_URL = "postgresql://beautybooker:beautybooker_dev@localhost:5432/beautybooker"
$env:JWT_SECRET = "dev-only-secret-key-minimum-32-characters-for-local-development"
$env:CORS_ORIGIN = "http://localhost:5173,http://localhost:8081"
node --enable-source-maps ./artifacts/api-server/dist/index.mjs
