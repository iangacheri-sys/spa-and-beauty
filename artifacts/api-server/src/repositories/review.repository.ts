import { prisma } from '../database/prisma';

export class ReviewRepository {
  async findMany(where?: any) {
    return (prisma as any).review.findMany({ 
      where,
      include: { author: { select: { id: true, name: true } } }
    });
  }

  async findById(id: string) {
    return (prisma as any).review.findUnique({ where: { id } });
  }

  async create(data: any) {
    return (prisma as any).review.create({ data });
  }

  async update(id: string, data: any) {
    return (prisma as any).review.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    return (prisma as any).review.delete({ where: { id } });
  }
}

export const reviewRepository = new ReviewRepository();
