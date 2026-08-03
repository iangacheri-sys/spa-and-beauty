import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { walletService } from '../services/wallet.service';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// GET /api/wallet — get my wallet
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await walletService.getOrCreate(req.user!.id);
    res.json(wallet);
  } catch (err) { next(err); }
});

// POST /api/wallet/topup — add funds (M-Pesa reference comes from callback)
router.post('/topup', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, reference } = req.body;
    const wallet = await walletService.topup(req.user!.id, Number(amount), reference);
    res.json(wallet);
  } catch (err) { next(err); }
});

// POST /api/wallet/spend — deduct funds for booking payment
router.post('/spend', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, description } = req.body;
    const wallet = await walletService.spend(req.user!.id, Number(amount), description);
    res.json(wallet);
  } catch (err) { next(err); }
});

// POST /api/wallet/gift-cards — generate a gift card (owner/admin)
router.post('/gift-cards', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaId, value } = req.body;
    const card = await walletService.generateGiftCard(spaId || null, Number(value), req.user!.id);
    res.status(201).json(card);
  } catch (err) { next(err); }
});

// GET /api/wallet/gift-cards?spaId= — list gift cards for a spa
router.get('/gift-cards', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaId } = req.query as { spaId: string };
    if (!spaId) return res.status(400).json({ error: 'spaId is required' });
    const cards = await walletService.getGiftCardsBySpa(spaId);
    res.json(cards);
  } catch (err) { next(err); }
});

// POST /api/wallet/gift-cards/redeem — redeem a gift card
router.post('/gift-cards/redeem', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    const result = await walletService.redeemGiftCard(req.user!.id, code);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
