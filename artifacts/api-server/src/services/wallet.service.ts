import { prisma } from '../database/prisma';
import crypto from 'crypto';

export class WalletService {
  async getOrCreate(userId: string) {
    let wallet = await prisma.beautyWallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 30 } },
    });
    if (!wallet) {
      wallet = await prisma.beautyWallet.create({
        data: { userId },
        include: { transactions: true },
      });
    }
    return wallet;
  }

  async topup(userId: string, amount: number, reference?: string) {
    if (amount <= 0) throw new Error('Topup amount must be positive');
    const wallet = await this.getOrCreate(userId);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.beautyWallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'TOPUP',
          amount,
          reference,
          description: `Wallet topup — KES ${amount}`,
        },
      });
      return updated;
    });
  }

  async spend(userId: string, amount: number, description: string) {
    if (amount <= 0) throw new Error('Spend amount must be positive');
    const wallet = await this.getOrCreate(userId);
    if (wallet.balance < amount) {
      throw new Error(`Insufficient wallet balance. Available: KES ${wallet.balance}`);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.beautyWallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'SPEND',
          amount: -amount,
          description,
        },
      });
      return updated;
    });
  }

  // ── Gift Cards ──────────────────────────────────────────────────

  async generateGiftCard(spaId: string | null, value: number, purchasedBy: string) {
    const code = 'BEAU-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    return prisma.giftCard.create({
      data: {
        spaId,
        code,
        value,
        balance: value,
        purchasedBy,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });
  }

  async redeemGiftCard(userId: string, code: string) {
    const card = await prisma.giftCard.findUnique({ where: { code } });
    if (!card) throw new Error('Gift card not found');
    if (!card.isActive) throw new Error('Gift card is no longer active');
    if (card.redeemedBy) throw new Error('Gift card already redeemed');
    if (card.expiresAt && card.expiresAt < new Date()) throw new Error('Gift card expired');

    return prisma.$transaction(async (tx) => {
      // Topup wallet with gift card balance
      const wallet = await this.getOrCreate(userId);
      const updated = await tx.beautyWallet.update({
        where: { userId },
        data: { balance: { increment: card.balance } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'GIFT_CARD',
          amount: card.balance,
          reference: card.code,
          description: `Gift card redeemed — ${code}`,
        },
      });
      await tx.giftCard.update({
        where: { code },
        data: { redeemedBy: userId, isActive: false, balance: 0 },
      });
      return { wallet: updated, giftCard: card };
    });
  }

  async getGiftCardsBySpa(spaId: string) {
    return prisma.giftCard.findMany({
      where: { spaId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const walletService = new WalletService();
