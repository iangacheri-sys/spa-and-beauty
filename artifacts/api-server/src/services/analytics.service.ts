import { prisma } from '../database/prisma';

export class AnalyticsService {
  async getDashboardStats(spaId: string, startDate?: string, endDate?: string) {
    // Determine date range
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const whereSpa = { spaId, createdAt: { gte: start, lte: end } };
    const whereDateOnly = { createdAt: { gte: start, lte: end } };
    
    // Total Revenue (from completed bookings and orders)
    // Assuming we can sum up booking prices or order amounts
    // Simplified for MVP: Count bookings and multiply by avg service price if no direct revenue field
    const bookings = await prisma.booking.findMany({
      where: { spaId, status: 'COMPLETED', date: { gte: startStr, lte: endStr } },
      include: { service: true }
    });
    
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);
    const totalBookings = bookings.length;
    
    const newClients = await prisma.user.count({
      where: {
        bookings: { some: { spaId } },
        createdAt: { gte: start, lte: end }
      }
    });

    const activeStaff = await prisma.therapist.count({
      where: { spaId, isActive: true }
    });

    return {
      revenue: totalRevenue,
      bookings: totalBookings,
      newClients,
      activeStaff,
    };
  }

  async getRevenueChart(spaId: string, days: number = 30) {
    const start = new Date(new Date().setDate(new Date().getDate() - days));
    const startStr = start.toISOString().split('T')[0];
    
    const bookings = await prisma.booking.findMany({
      where: { spaId, status: 'COMPLETED', date: { gte: startStr } },
      include: { service: true }
    });

    // Group by date
    const dailyData: Record<string, number> = {};
    for (const b of bookings) {
      const dateStr = b.date; // already a YYYY-MM-DD string
      if (!dailyData[dateStr]) dailyData[dateStr] = 0;
      dailyData[dateStr] += (b.service?.price || 0);
    }

    return Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const analyticsService = new AnalyticsService();
