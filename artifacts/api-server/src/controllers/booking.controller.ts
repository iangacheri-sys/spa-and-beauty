import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/booking.service';
import { notificationService } from '../services/notification.service';

export class BookingController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await bookingService.getAll(req.query);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await bookingService.getById(req.params.id as string);
      res.json(item);
    } catch (err: any) {
      if (err.message === 'Booking not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await bookingService.create(req.body);
      
      // Send confirmation notification
      notificationService.sendBookingConfirmation(item.id).catch(err => {
        console.error('Failed to send booking notification:', err);
      });

      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await bookingService.update(req.params.id as string, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
  
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await bookingService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const bookingController = new BookingController();
