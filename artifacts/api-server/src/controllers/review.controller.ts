import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';

export class ReviewController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as any;
      const items = await reviewService.getAll(filters);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await reviewService.getById(req.params.id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Ensure the authorId is set to the current user
      const item = await reviewService.create({
        ...req.body,
        authorId: req.user?.id
      });
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await reviewService.update(req.params.id, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await reviewService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const reviewController = new ReviewController();
