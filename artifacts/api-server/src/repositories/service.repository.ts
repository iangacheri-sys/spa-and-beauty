import { prisma } from '../database/prisma';
import { Prisma } from '@prisma/client';

export class ServiceRepository {
  async findMany(where?: any) {
    return (prisma as any).service.findMany({ where });
  }

  async findById(id: string) {
    return (prisma as any).service.findUnique({ where: { id } });
  }

  async create(data: any) {
    return (prisma as any).service.create({ data });
  }

  async update(id: string, data: any) {
    return (prisma as any).service.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    return (prisma as any).service.delete({ where: { id } });
  }
}

export const serviceRepository = new ServiceRepository();
