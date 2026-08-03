import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';

const router = Router();

// GET /api/search/spas?q=&category=&county=&lat=&lon=&radius=&minRating=&page=&limit=
router.get('/spas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, category, county, minRating, lat, lon, radius, page, limit } = req.query as Record<string, string>;
    const results = await searchService.searchSpas({
      q,
      category,
      county,
      minRating: minRating ? Number(minRating) : undefined,
      lat: lat ? Number(lat) : undefined,
      lon: lon ? Number(lon) : undefined,
      radius: radius ? Number(radius) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(results);
  } catch (err) { next(err); }
});

// GET /api/search/services?q=&spaId=&category=&maxPrice=
router.get('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, spaId, category, maxPrice } = req.query as Record<string, string>;
    const results = await searchService.searchServices({
      q, spaId, category,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
    res.json(results);
  } catch (err) { next(err); }
});

export default router;
