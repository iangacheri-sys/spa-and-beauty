import { prisma } from '../database/prisma';
import { Prisma } from '@prisma/client';

export class SpaRepository {
  async findAll(includeAll: boolean = false) {
    const orderBy: Prisma.SpaOrderByWithRelationInput[] = [
      { isSponsored: 'desc' },
      { rankingScore: 'desc' },
      { createdAt: 'desc' }
    ];

    if (includeAll) {
      return prisma.spa.findMany({ orderBy });
    }
    return prisma.spa.findMany({ 
      where: { approvalStatus: 'APPROVED' },
      orderBy 
    });
  }

  async findById(id: string) {
    return prisma.spa.findUnique({ where: { id } });
  }

  async create(data: Prisma.SpaCreateInput) {
    return prisma.spa.create({ data });
  }

  async update(id: string, data: Prisma.SpaUpdateInput) {
    return prisma.spa.update({ where: { id }, data });
  }
}

export const spaRepository = new SpaRepository();
