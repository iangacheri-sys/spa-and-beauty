import { prisma } from '../database/prisma';

const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 500,
  GOLD: 2000,
  PLATINUM: 5000,
};

function getTier(points: number): string {
  if (points >= TIER_THRESHOLDS.PLATINUM) return 'PLATINUM';
  if (points >= TIER_THRESHOLDS.GOLD) return 'GOLD';
  if (points >= TIER_THRESHOLDS.SILVER) return 'SILVER';
  return 'BRONZE';
}

export class LoyaltyService {
  async getOrCreateAccount(userId: string) {
    let account = await prisma.loyaltyAccount.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!account) {
      account = await prisma.loyaltyAccount.create({
        data: { userId },
        include: { transactions: true },
      });
    }
    return account;
  }

  async earnPoints(userId: string, points: number, description: string) {
    const account = await this.getOrCreateAccount(userId);
    const newPoints = account.points + points;
    const tier = getTier(newPoints);

    const [updated] = await prisma.$transaction([
      prisma.loyaltyAccount.update({
        where: { userId },
        data: { points: newPoints, tier },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: 'EARN',
          points,
          description,
        },
      }),
    ]);

    return { ...updated, tierUpgrade: tier !== account.tier ? tier : null };
  }

  async redeemPoints(userId: string, points: number, description: string) {
    const account = await this.getOrCreateAccount(userId);
    if (account.points < points) {
      throw new Error(`Insufficient points. You have ${account.points}, need ${points}.`);
    }

    const newPoints = account.points - points;
    const tier = getTier(newPoints);

    const [updated] = await prisma.$transaction([
      prisma.loyaltyAccount.update({
        where: { userId },
        data: { points: newPoints, tier },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: 'REDEEM',
          points: -points,
          description,
        },
      }),
    ]);

    return updated;
  }

  async getTransactions(userId: string, limit = 50) {
    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    if (!account) return [];
    return prisma.loyaltyTransaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /** Call this after a booking is COMPLETED to auto-award points */
  async awardBookingPoints(userId: string, bookingAmount: number, bookingId: string) {
    // 1 point per KES 10 spent
    const points = Math.floor(bookingAmount / 10);
    if (points > 0) {
      await this.earnPoints(userId, points, `Booking reward — ${points} pts for KES ${bookingAmount}`);
    }
  }
}

export const loyaltyService = new LoyaltyService();
