import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await productService.getAll(req.query);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await productService.getById(req.params.id as string);
      res.json(item);
    } catch (err: any) {
      if (err.message === 'Product not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await productService.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await productService.update(req.params.id as string, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
  
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const productController = new ProductController();
