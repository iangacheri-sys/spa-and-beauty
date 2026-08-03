import { prisma } from '../database/prisma';

export class UserRepository {
  async create(data: any) {
    return prisma.user.create({ data });
  }

  async findByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ 
      where: { id },
      include: { ownedSpas: true }
    });
  }

  async findAll(role?: string) {
    return prisma.user.findMany({
      where: role ? { role: role as any } : undefined,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.user.update({ where: { id }, data });
  }
}

export const userRepository = new UserRepository();
