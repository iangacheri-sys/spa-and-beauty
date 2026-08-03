import { prisma } from '../database/prisma';
import { Prisma } from '@prisma/client';

export class BookingRepository {
  async findMany(where?: any) {
    return (prisma as any).booking.findMany({ where });
  }

  async findById(id: string) {
    return (prisma as any).booking.findUnique({ where: { id } });
  }

  async create(data: any) {
    return (prisma as any).booking.create({ data });
  }

  async update(id: string, data: any) {
    return (prisma as any).booking.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    return (prisma as any).booking.delete({ where: { id } });
  }
}

export const bookingRepository = new BookingRepository();
