import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  console.log("==> Running Prisma migrations...");
  // Use stdio: 'inherit' so all logs from Prisma are printed directly to Railway's console
  execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: __dirname });
  
  console.log("==> Starting Node server...");
  // Dynamically import the bundled server
  await import('./dist/index.mjs');
} catch (error) {
  console.error("\n=======================================================");
  console.error("FATAL STARTUP ERROR:");
  console.error("=======================================================\n");
  if (error.stdout) console.error(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
  console.error(error.message || error);
  process.exit(1);
}
