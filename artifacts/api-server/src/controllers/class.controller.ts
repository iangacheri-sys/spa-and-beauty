import { Request, Response, NextFunction } from 'express';
import { classService } from '../services/class.service';

export class ClassController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await classService.getAll(req.query);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await classService.getById(req.params.id as string);
      res.json(item);
    } catch (err: any) {
      if (err.message === 'Class not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await classService.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await classService.update(req.params.id as string, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
  
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await classService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const classController = new ClassController();
