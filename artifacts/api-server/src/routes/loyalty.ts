import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { loyaltyService } from '../services/loyalty.service';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// GET /api/loyalty — get my account and balance
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await loyaltyService.getOrCreateAccount(req.user!.id);
    res.json(account);
  } catch (err) { next(err); }
});

// GET /api/loyalty/transactions — list my transactions
router.get('/transactions', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await loyaltyService.getTransactions(req.user!.id, Number(req.query.limit) || 50);
    res.json(items);
  } catch (err) { next(err); }
});

// POST /api/loyalty/earn — admin/system: award points
router.post('/earn', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, points, description } = req.body;
    const targetId = userId || req.user!.id;
    const result = await loyaltyService.earnPoints(targetId, points, description);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/loyalty/redeem — redeem points
router.post('/redeem', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { points, description } = req.body;
    const result = await loyaltyService.redeemPoints(req.user!.id, points, description || 'Points redeemed');
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
