import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { userRepository } from '../repositories/user.repository';
import { prisma } from '../database/prisma';

const router = Router();

// Platform admins can list all users (e.g., for the admin dashboard)
router.get('/', requireAuth, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), async (req, res, next) => {
  try {
    const { role } = req.query;
    // Non-platform admins can only see users of their own spa scope
    const users = await userRepository.findAll(role as string | undefined);
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Any authenticated user can fetch their own profile
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _pw, ...safeUser } = user as any;

    // Compute convenience fields the same way the login path does,
    // so the frontend can use this endpoint to refresh user state.
    const ownedSpa = safeUser.ownedSpas?.[0];
    const enriched = {
      ...safeUser,
      spaId: ownedSpa?.id ?? null,
      spaSetupComplete: ownedSpa?.setupComplete ?? null,
      spaApprovalStatus: ownedSpa?.approvalStatus ?? null,
    };

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/at-risk — Returns at-risk CRM segments for a spa
// An "at-risk" client is one who has completed at least 1 booking but hasn't returned in 30+ days
router.get('/at-risk', requireAuth, requireRole(['SPA_OWNER', 'MANAGER', 'PLATFORM_ADMIN']), async (req, res, next) => {
  try {
    const spaId = (req as any).user?.spaId;
    if (!spaId) return res.status(403).json({ error: 'No spa associated with this account' });

    const today = new Date();

    // Fetch all bookings for this spa with user info
    const bookings = await prisma.booking.findMany({
      where: { spaId },
      include: { customer: true, service: true },
      orderBy: { date: 'desc' }
    });

    // Build client map: userId -> { user, bookings, totalSpend, lastBookingDate }
    const clientMap: Record<string, {
      user: any;
      totalSpend: number;
      completedCount: number;
      lastBookingDate: string | null;
      bookings: any[];
    }> = {};

    for (const b of bookings) {
      if (!clientMap[b.userId]) {
        clientMap[b.userId] = {
          user: b.customer,
          totalSpend: 0,
          completedCount: 0,
          lastBookingDate: null,
          bookings: []
        };
      }
      clientMap[b.userId].bookings.push(b);
      if (b.status === 'COMPLETED') {
        clientMap[b.userId].totalSpend += b.price ?? b.service?.price ?? 0;
        clientMap[b.userId].completedCount++;
        // Track most recent booking date
        if (!clientMap[b.userId].lastBookingDate || b.date > clientMap[b.userId].lastBookingDate!) {
          clientMap[b.userId].lastBookingDate = b.date;
        }
      }
    }

    // Segment clients
    const atRisk = Object.values(clientMap)
      .filter(c => c.completedCount > 0) // Has completed at least 1 booking
      .map(c => {
        const lastDate = c.lastBookingDate ? new Date(c.lastBookingDate) : null;
        const daysSinceLast = lastDate
          ? Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          : 9999;

        let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
        if (daysSinceLast >= 90) riskLevel = 'HIGH';
        else if (daysSinceLast >= 45) riskLevel = 'MEDIUM';
        else riskLevel = 'LOW';

        return {
          id: c.user.id,
          name: c.user.name,
          phone: c.user.phone,
          email: c.user.email,
          totalSpend: c.totalSpend,
          completedBookings: c.completedCount,
          lastBookingDate: c.lastBookingDate,
          daysSinceLastBooking: daysSinceLast,
          riskLevel,
          clv: c.totalSpend, // Customer Lifetime Value = total completed spend
        };
      })
      .filter(c => c.daysSinceLastBooking >= 30) // Only those who've been inactive 30+ days
      .sort((a, b) => b.clv - a.clv); // Sort by highest CLV first (most valuable at-risk first)

    res.json(atRisk);
  } catch (err) {
    next(err);
  }
});

export default router;

