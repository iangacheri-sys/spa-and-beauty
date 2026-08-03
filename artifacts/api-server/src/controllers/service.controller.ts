import { Request, Response, NextFunction } from 'express';
import { serviceService } from '../services/service.service';

export class ServiceController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await serviceService.getAll(req.query);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await serviceService.getById(req.params.id as string);
      res.json(item);
    } catch (err: any) {
      if (err.message === 'Service not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const user = (req as any).user;
      
      if (user?.spaId && !data.spaId) {
        data.spaId = user.spaId;
      }

      const item = await serviceService.create(data);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await serviceService.update(req.params.id as string, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
  
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await serviceService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const serviceController = new ServiceController();
