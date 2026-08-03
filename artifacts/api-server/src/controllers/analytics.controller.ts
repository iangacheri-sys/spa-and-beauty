import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { spaId } = req.query as any;
      if (!spaId) return res.status(400).json({ error: 'spaId query parameter is required' });
      
      const stats = await analyticsService.getDashboardStats(spaId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  async getRevenueChart(req: Request, res: Response, next: NextFunction) {
    try {
      const { spaId, days } = req.query as any;
      if (!spaId) return res.status(400).json({ error: 'spaId query parameter is required' });
      
      const chartData = await analyticsService.getRevenueChart(spaId, days ? parseInt(days) : 30);
      res.json(chartData);
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
