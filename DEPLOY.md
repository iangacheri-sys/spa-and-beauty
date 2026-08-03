# Beauty-Booker Deployment Guide
> Deploy all 3 apps with seeded demo data in ~45 minutes. All services used have **free tiers**.

---

## Prerequisites
- Git repository pushed to GitHub
- Node.js 18+ installed locally
- pnpm installed (`npm install -g pnpm`)

---

## Step 1 — Create Free PostgreSQL Database (Neon)

1. Go to [neon.tech](https://neon.tech) → **Sign Up** (GitHub login works)
2. Click **New Project** → Name it `beauty-booker`
3. Select region closest to your users (e.g. `eu-west-1` for Kenya via Europe)
4. Copy the **Connection String** — it looks like:
   ```
   postgresql://neondb_owner:xxxx@ep-xxx.eu-west-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this as `DATABASE_URL` — you'll need it in the next step.

---

## Step 2 — Deploy API Server (Railway)

### 2a. Create Railway account
1. Go to [railway.app](https://railway.app) → **Sign Up** (GitHub login)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `Beauty-Booker` repository

### 2b. Configure the service
1. In the Railway project, click **Settings** → **General**
2. Set **Root Directory**: leave empty (the `railway.json` in root handles it)
3. Under **Variables**, add these environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | *(your Neon connection string)* |
| `JWT_SECRET` | *(any random 32+ character string — generate at [random.org](https://www.random.org/strings/))* |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CORS_ORIGIN` | *(add your Vercel URL after Step 3, e.g. `https://beauty-booker.vercel.app`)* |
| `RATE_LIMIT_MAX` | `500` |

4. Click **Deploy** — wait for the build to complete (~3 min)
5. Copy your Railway **public domain** (e.g. `https://beauty-booker-api.railway.app`)

### 2c. Run database migrations and seed
Once the API is deployed, run these commands from the Railway dashboard terminal (or Railway CLI):

```bash
# Option A: Using Railway CLI
npm install -g @railway/cli
railway login
railway run --service api-server pnpm --filter @workspace/api-server run db:migrate:prod
railway run --service api-server pnpm --filter @workspace/api-server run db:seed
```

```bash
# Option B: Trigger via a one-time job in Railway UI
# Go to Settings → Commands → add a one-time run:
# pnpm --filter @workspace/api-server run db:migrate:prod && pnpm --filter @workspace/api-server run db:seed
```

### 2d. Verify API is working
Open in browser:
```
https://your-api.railway.app/api/health
```
Should return: `{ "status": "ok", "timestamp": "..." }`

---

## Step 3 — Deploy Admin Dashboard (Vercel)

### 3a. Create Vercel account
1. Go to [vercel.com](https://vercel.com) → **Sign Up** (GitHub login)
2. Click **Add New Project** → **Import Git Repository**
3. Select your `Beauty-Booker` repository

### 3b. Configure project
Vercel will auto-detect the `vercel.json` config. Just add environment variables:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-api.railway.app` *(from Step 2)* |
| `PORT` | `3000` |
| `BASE_PATH` | `/` |

4. Click **Deploy** — build takes ~2 min
5. Copy your Vercel URL (e.g. `https://beauty-booker-admin.vercel.app`)

### 3c. Update CORS on Railway
Go back to Railway → Variables → update `CORS_ORIGIN`:
```
https://beauty-booker-admin.vercel.app
```

### 3d. Verify Admin Dashboard
1. Open your Vercel URL
2. Login with: Phone `0700000000` / Password `password` (Platform Admin)
3. You should see the Dashboard with seeded revenue data

---

## Step 4 — Publish Mobile App (Expo Go)

### Option A: Expo Go (fastest — for testing/demos, no app store)

1. Update your local `.env` in `artifacts/mobile/`:
   ```env
   EXPO_PUBLIC_API_URL=https://your-api.railway.app
   ```

2. Install Expo CLI:
   ```bash
   npm install -g expo-cli
   ```

3. Start and publish:
   ```bash
   cd artifacts/mobile
   npx expo publish
   ```

4. This generates a **QR code** anyone with the [Expo Go](https://expo.dev/go) app can scan to try your app instantly.

### Option B: EAS Build (shareable APK)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. Set the API URL as an EAS secret:
   ```bash
   eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://your-api.railway.app"
   ```

3. Build a preview APK:
   ```bash
   cd artifacts/mobile
   eas build --platform android --profile preview
   ```

4. Download and share the APK link from [expo.dev](https://expo.dev)

---

## Demo Credentials (all use password: `password`)

| Role | Phone | What they see |
|---|---|---|
| Platform Admin | `0700000000` | Revenue dashboard, all spas, investor metrics |
| Spa Owner | `0712121212` | Bofa Beach Wellness dashboard, bookings, CRM |
| Therapist | `0713131313` | Their schedule and client history |
| Demo Client | `0744444444` | Mobile app booking flow, loyalty points |

---

## Troubleshooting

### API returns 500 or "Cannot connect to database"
- Check Railway logs → ensure `DATABASE_URL` is set correctly with `?sslmode=require`
- Make sure you ran `db:migrate:prod` before `db:seed`

### Admin shows blank screen or auth errors
- Open browser console → check for CORS errors
- Ensure `CORS_ORIGIN` in Railway includes your exact Vercel URL (no trailing slash)
- Ensure `VITE_API_URL` in Vercel does NOT have a trailing slash

### Mobile app can't connect
- Confirm `EXPO_PUBLIC_API_URL` is set to the Railway URL (not localhost)
- Check Railway logs for incoming requests

### Seed fails
- Run `db:migrate:prod` first, then `db:seed`
- If seed errors on duplicate data, run: `railway run pnpm --filter @workspace/api-server run db:reset`
  then re-run seed (⚠️ this wipes all data)

---

## Architecture Summary

```
Expo Go / APK  ──→  Railway (Express API + Prisma)  ──→  Neon PostgreSQL
Vercel Admin   ──→  Railway (Express API + Prisma)
```

All seeded with realistic Kenyan spa data from `prisma/seed.ts`.
