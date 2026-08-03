import { prisma } from '../database/prisma';

export class InventoryService {
  async getStockLevels(spaId: string) {
    return prisma.product.findMany({
      where: { spaId },
      orderBy: { stock: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        stock: true,
        image: true,
      },
    });
  }

  async getLowStockAlerts(spaId: string, threshold = 5) {
    return prisma.product.findMany({
      where: { spaId, stock: { lte: threshold } },
      orderBy: { stock: 'asc' },
      select: { id: true, name: true, category: true, stock: true },
    });
  }

  async adjustStock(
    spaId: string,
    productId: string,
    quantity: number,
    type: 'RESTOCK' | 'ADJUSTMENT' | 'WASTE',
    note?: string,
  ) {
    const product = await prisma.product.findFirst({ where: { id: productId, spaId } });
    if (!product) throw new Error('Product not found in this spa');

    const newStock = product.stock + quantity;
    if (newStock < 0) throw new Error('Stock cannot go below zero');

    const [updated] = await prisma.$transaction([
      prisma.product.update({ where: { id: productId }, data: { stock: newStock } }),
      prisma.inventoryMovement.create({
        data: { spaId, productId, type, quantity, note },
      }),
    ]);

    return updated;
  }

  async getMovementHistory(spaId: string, productId?: string, limit = 100) {
    return prisma.inventoryMovement.findMany({
      where: { spaId, ...(productId ? { productId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { product: { select: { name: true } } },
    });
  }
}

export const inventoryService = new InventoryService();
