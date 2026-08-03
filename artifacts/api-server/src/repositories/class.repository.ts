import { prisma } from '../database/prisma';
import { Prisma } from '@prisma/client';

export class ClassRepository {
  async findMany(where?: any) {
    return (prisma as any).trainingClass.findMany({ where, include: { enrolled: true } });
  }

  async findById(id: string) {
    return (prisma as any).trainingClass.findUnique({ where: { id }, include: { enrolled: true } });
  }

  async create(data: any) {
    return (prisma as any).trainingClass.create({ data });
  }

  async update(id: string, data: any) {
    return (prisma as any).trainingClass.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    return (prisma as any).trainingClass.delete({ where: { id } });
  }
}

export const classRepository = new ClassRepository();
