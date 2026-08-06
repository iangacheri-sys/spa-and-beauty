import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  console.log("==> Environment Check:");
  console.log("    DATABASE_URL:", process.env.DATABASE_URL ? "SET (length: " + process.env.DATABASE_URL.length + ")" : "MISSING");
  console.log("    DIRECT_URL:", process.env.DIRECT_URL ? "SET (length: " + process.env.DIRECT_URL.length + ")" : "MISSING");
  
  console.log("==> Running Prisma migrations...");
  const output = execSync('node ./node_modules/prisma/build/index.js migrate deploy', { cwd: __dirname, stdio: 'pipe' });
  console.log(output.toString());
  
  console.log("==> Starting Node server...");
  // Dynamically import the bundled server
  await import('./dist/index.mjs');
} catch (error) {
  console.error("\n=======================================================");
  console.error("FATAL STARTUP ERROR:");
  console.error("=======================================================\n");
  if (error.stdout) console.error("STDOUT:", error.stdout.toString());
  if (error.stderr) console.error("STDERR:", error.stderr.toString());
  console.error(error.message || error);
  process.exit(1);
}
