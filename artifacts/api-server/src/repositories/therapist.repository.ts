import { prisma } from '../database/prisma';
import { Prisma } from '@prisma/client';

export class TherapistRepository {
  async findMany(where?: any) {
    return (prisma as any).therapist.findMany({ where });
  }

  async findById(id: string) {
    return (prisma as any).therapist.findUnique({ where: { id } });
  }

  async create(data: any) {
    return (prisma as any).therapist.create({ data });
  }

  async update(id: string, data: any) {
    return (prisma as any).therapist.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    return (prisma as any).therapist.delete({ where: { id } });
  }
}

export const therapistRepository = new TherapistRepository();
