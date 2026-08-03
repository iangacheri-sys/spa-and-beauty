import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OrderController {
  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const { spaId, items } = req.body;
      const user = (req as any).user;
      const userId = user.id;

      if (!spaId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'spaId and items array are required' });
      }

      // Start transaction
      const order = await prisma.$transaction(async (tx) => {
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}`);
          }

          // Deduct stock
          await tx.product.update({
            where: { id: product.id },
            data: { stock: product.stock - item.quantity }
          });

          totalAmount += product.price * item.quantity;
          orderItemsData.push({
            productId: product.id,
            quantity: item.quantity,
            priceAtTime: product.price
          });
        }

        // Create order
        return tx.order.create({
          data: {
            spaId,
            userId,
            totalAmount,
            status: 'PENDING',
            items: {
              create: orderItemsData
            }
          },
          include: { items: true }
        });
      });

      res.status(201).json(order);
    } catch (err: any) {
      if (err.message.includes('stock') || err.message.includes('not found')) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: { items: { include: { product: true } }, spa: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json(orders);
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
