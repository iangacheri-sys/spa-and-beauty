import { prisma } from '../database/prisma';
import { Prisma } from '@prisma/client';

export class PaymentRepository {
  async findMany(where?: any) {
    return (prisma as any).payment.findMany({ where });
  }

  async findById(id: string) {
    return (prisma as any).payment.findUnique({ where: { id } });
  }

  async create(data: any) {
    return (prisma as any).payment.create({ data });
  }

  async update(id: string, data: any) {
    return (prisma as any).payment.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    return (prisma as any).payment.delete({ where: { id } });
  }
}

export const paymentRepository = new PaymentRepository();
