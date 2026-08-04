import { bookingRepository } from '../repositories/booking.repository';
import { serviceRepository } from '../repositories/service.repository';
import { prisma } from '../database/prisma';
import { loyaltyService } from './loyalty.service';
import { spaService } from './spa.service';

export class BookingService {
  async getAll(filters?: any) {
    return bookingRepository.findMany(filters);
  }

  async getById(id: string) {
    const item = await bookingRepository.findById(id);
    if (!item) throw new Error('Booking not found');
    return item;
  }

  async create(data: any) {
    // Strict Availability Check
    const { therapistId, date, timeSlot, serviceId } = data;
    
    // 1. Get the service to know its duration
    const service = await serviceRepository.findById(serviceId);
    if (!service) throw new Error('Service not found');
    
    const requestedDuration = service.duration;
    
    // Helper to convert "HH:MM" to minutes since midnight
    const timeToMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    
    const reqStart = timeToMins(timeSlot);
    const reqEnd = reqStart + requestedDuration;

    // 1b. Check TherapistSchedule
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getUTCDay();
    
    const schedule = await prisma.therapistSchedule.findUnique({
      where: { therapistId_dayOfWeek: { therapistId, dayOfWeek } }
    });

    if (!schedule || !schedule.isWorking) {
      throw new Error('Therapist is not working on this day.');
    }

    const shiftStart = timeToMins(schedule.startTime);
    const shiftEnd = timeToMins(schedule.endTime);

    if (reqStart < shiftStart || reqEnd > shiftEnd) {
      throw new Error(`Requested time falls outside therapist working hours (${schedule.startTime} - ${schedule.endTime}).`);
    }

    // 1c. Check TimeOff
    const overlappingTimeOff = await prisma.timeOff.findFirst({
      where: {
        OR: [{ therapistId: null }, { therapistId }],
        startDate: { lte: date },
        endDate: { gte: date }
      }
    });

    if (overlappingTimeOff) {
      throw new Error(`Therapist is on time off (Reason: ${overlappingTimeOff.reason || 'Not specified'}).`);
    }

    // 2. Fetch existing bookings for this therapist on this date
    const existingBookings = await bookingRepository.findMany({
      therapistId,
      date,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] }
    });

    // 3. Check for overlap with existing bookings
    for (const booking of existingBookings) {
      // Need to get duration of existing booking's service.
      // Ideally we'd fetch it with include: { service: true } but findMany here doesn't support typed includes easily due to (prisma as any).
      // We will fetch the service individually for now (or assume a standard slot if not fetched, but let's fetch to be safe).
      const existingService = await serviceRepository.findById(booking.serviceId);
      const existingDuration = existingService?.duration || 60; // Fallback to 60 mins if service deleted
      
      const exStart = timeToMins(booking.timeSlot);
      const exEnd = exStart + existingDuration;

      // Overlap condition:
      // Req starts before Ex ends AND Req ends after Ex starts
      if (reqStart < exEnd && reqEnd > exStart) {
        throw new Error(`Therapist is not available at ${timeSlot}. Booking conflicts with an existing appointment.`);
      }
    }

    return bookingRepository.create(data);
  }

  async update(id: string, data: any) {
    const existing = await bookingRepository.findById(id);
    if (!existing) throw new Error('Booking not found');

    const updated = await bookingRepository.update(id, data);

    // If status changed to COMPLETED
    if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      
      // 1. COMMISSION RECORD
      const service = await prisma.service.findUnique({ where: { id: updated.serviceId } });
      if (service && service.commissionPercent > 0) {
        const amount = updated.price * (service.commissionPercent / 100);
        await prisma.commissionRecord.create({
          data: {
            spaId: updated.spaId,
            therapistId: updated.therapistId,
            bookingId: updated.id,
            amount,
            status: 'PENDING',
          }
        });
      }

      // 2. REFERRAL REWARDS (If first booking and has referredById)
      const user = await prisma.user.findUnique({ where: { id: updated.userId } });
      if (user?.referredById) {
        // Check if this is their first completed booking
        const completedCount = await prisma.booking.count({
          where: { userId: user.id, status: 'COMPLETED' }
        });
        
        if (completedCount === 1) { // This is the first one!
          // Reward the referrer
          // 500 Loyalty points
          await loyaltyService.earnPoints(user.referredById, 500, `Referral reward for ${user.name}`);
          
          // 500 KES Wallet Balance
          let wallet = await prisma.beautyWallet.findUnique({ where: { userId: user.referredById } });
          if (!wallet) {
            wallet = await prisma.beautyWallet.create({ data: { userId: user.referredById, balance: 0 } });
          }
          await prisma.beautyWallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: 500 } }
          });
          
          await prisma.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'TOPUP',
              amount: 500,
              description: `Referral bonus for ${user.name}`
            }
          });
        }
      }
    }

    if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(updated.status)) {
      await spaService.recalculateRanking(updated.spaId);
    }

    return updated;
  }
  
  async delete(id: string) {
    return bookingRepository.delete(id);
  }
}

export const bookingService = new BookingService();
