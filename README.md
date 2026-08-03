# Beauty-Booker

A full-stack booking application tailored for beauty salons and therapists, featuring an admin dashboard for staff management and a mobile app for customers to book appointments.

## Tech Stack

This project is structured as a **pnpm monorepo** containing multiple applications and shared libraries:
- **Backend API:** Node.js 24, Express 5, PostgreSQL + Drizzle ORM, Zod Validation
- **Admin Dashboard:** React, Vite, Tailwind CSS, Radix UI
- **Mobile App:** React Native, Expo, Expo Router
- **Tooling:** pnpm workspaces, TypeScript 5.9, esbuild

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v20+ recommended)
- **pnpm** (install globally via `npm install -g pnpm`)

## Installation

1. Clone or download the repository.
2. Open the inner `Beauty-Booker` folder in your terminal or VS Code.
3. Install all workspace dependencies by running:
   ```bash
   pnpm install
   ```

## Running the Project Locally

The project consists of three main applications that you can run simultaneously. It is recommended to open multiple terminal tabs in VS Code to run them side-by-side.

### 1. API Server (Backend)
Runs the Express REST API.
```bash
pnpm --filter @workspace/api-server run dev
```

### 2. Admin Dashboard (Web)
Runs the Vite development server for the React admin web panel.
```bash
pnpm --filter @workspace/admin run dev
```

### 3. Mobile App (iOS/Android)
Runs the Expo development server. You can view the app by downloading the "Expo Go" app on your physical device and scanning the QR code, or by using an iOS Simulator / Android Emulator.
```bash
pnpm --filter @workspace/mobile run dev
```

## Project Structure

- `artifacts/api-server`: The backend Express application.
- `artifacts/admin`: The React frontend for the admin panel.
- `artifacts/mobile`: The Expo/React Native mobile application.
- `lib/*`: Shared libraries, databases, and Zod schemas used across the monorepo.

## Notes on Cross-Platform Compatibility
The NPM scripts have been fully configured to support seamless execution on **Windows (PowerShell/CMD)**, macOS, and Linux using `cross-env`. 

## Additional Scripts

- `pnpm run typecheck` — Run TypeScript type checking across all packages.
- `pnpm run build` — Build all workspace packages.
- `pnpm --filter @workspace/db run push` — Push local DB schema changes to the database.
