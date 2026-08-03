import { Router, type IRouter } from "express";
import { PrismaClient } from '@prisma/client';

const router: IRouter = Router();
const prisma = new PrismaClient();

// GET /api/health (and /api/health/healthz for backward compatibility)
router.get(["/", "/healthz"], async (_req, res) => {
  try {
    // Ping DB to ensure it's up
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

export default router;
