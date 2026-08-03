import { Request, Response, NextFunction } from 'express';
import { spaService } from '../services/spa.service';

export class SpaController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeAll = req.query.all === 'true';
      const spas = await spaService.getAllSpas(includeAll);
      res.json(spas);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const spa = await spaService.getSpaById(req.params.id as string);
      res.json(spa);
    } catch (err: any) {
      if (err.message === 'Spa not found') {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user!; // Cast temporarily until we fix auth middleware types
      const updated = await spaService.updateSpa(req.params.id as string, req.body, user.role, user.spaId);
      res.json(updated);
    } catch (err: any) {
      if (err.message === 'Forbidden') {
        return res.status(403).json({ error: err.message });
      }
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const updated = await spaService.updateSpaStatus(req.params.id as string, status);
      res.json(updated);
    } catch (err: any) {
      next(err);
    }
  }
}

export const spaController = new SpaController();
