import { spaRepository } from '../repositories/spa.repository';
import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';

export class SpaService {
  async getAllSpas(includeAll: boolean = false) {
    return spaRepository.findAll(includeAll);
  }

  async getSpaById(id: string) {
    const spa = await spaRepository.findById(id);
    if (!spa) {
      throw new Error('Spa not found');
    }
    return spa;
  }

  async updateSpa(id: string, data: Prisma.SpaUpdateInput, userRole: string, userSpaId?: string) {
    if (userRole !== 'PLATFORM_ADMIN' && userSpaId !== id) {
      throw new Error('Forbidden');
    }
    return spaRepository.update(id, data);
  }

  async updateSpaStatus(id: string, status: any) {
    return spaRepository.update(id, { approvalStatus: status });
  }

  async recalculateRanking(spaId: string) {
    const spa = await prisma.spa.findUnique({ where: { id: spaId } });
    if (!spa) return;

    // Get completed bookings
    const completedCount = await prisma.booking.count({
      where: { spaId, status: 'COMPLETED' }
    });

    // Get cancelled/no-show bookings
    const cancelledCount = await prisma.booking.count({
      where: { spaId, status: { in: ['CANCELLED', 'NO_SHOW'] } }
    });

    const totalBookings = completedCount + cancelledCount;
    const cancellationRate = totalBookings > 0 ? (cancelledCount / totalBookings) * 100 : 0;

    // Normalize counts for scoring (prevent massive numbers from completely overshadowing rating)
    // E.g., cap completed impact at 100
    const normalizedCompleted = Math.min(completedCount, 100);

    // Score Formula: (rating * 0.4) + (completedBookings * 0.3) - (cancellationRate * 0.3)
    let rankingScore = (spa.rating * 0.4) + (normalizedCompleted * 0.3) - (cancellationRate * 0.3);
    
    // Ensure it doesn't go below 0
    rankingScore = Math.max(0, rankingScore);

    await spaRepository.update(spaId, { rankingScore });
  }
}

export const spaService = new SpaService();
