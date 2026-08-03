import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// GET /api/inventory?spaId= — stock levels
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaId } = req.query as { spaId: string };
    if (!spaId) return res.status(400).json({ error: 'spaId is required' });
    const items = await inventoryService.getStockLevels(spaId);
    res.json(items);
  } catch (err) { next(err); }
});

// GET /api/inventory/alerts?spaId=&threshold= — low stock alerts
router.get('/alerts', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaId, threshold } = req.query as { spaId: string; threshold?: string };
    if (!spaId) return res.status(400).json({ error: 'spaId is required' });
    const alerts = await inventoryService.getLowStockAlerts(spaId, threshold ? Number(threshold) : 5);
    res.json(alerts);
  } catch (err) { next(err); }
});

// POST /api/inventory/adjust — stock adjustment
router.post('/adjust', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaId, productId, quantity, type, note } = req.body;
    const result = await inventoryService.adjustStock(spaId, productId, Number(quantity), type, note);
    res.json(result);
  } catch (err) { next(err); }
});

// GET /api/inventory/history?spaId=&productId= — movement history
router.get('/history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaId, productId } = req.query as { spaId: string; productId?: string };
    if (!spaId) return res.status(400).json({ error: 'spaId is required' });
    const history = await inventoryService.getMovementHistory(spaId, productId);
    res.json(history);
  } catch (err) { next(err); }
});

export default router;
