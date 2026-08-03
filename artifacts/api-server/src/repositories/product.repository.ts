import { prisma } from '../database/prisma';
import { Prisma } from '@prisma/client';

export class ProductRepository {
  async findMany(where?: any) {
    return (prisma as any).product.findMany({ where });
  }

  async findById(id: string) {
    return (prisma as any).product.findUnique({ where: { id } });
  }

  async create(data: any) {
    return (prisma as any).product.create({ data });
  }

  async update(id: string, data: any) {
    return (prisma as any).product.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    return (prisma as any).product.delete({ where: { id } });
  }
}

export const productRepository = new ProductRepository();
