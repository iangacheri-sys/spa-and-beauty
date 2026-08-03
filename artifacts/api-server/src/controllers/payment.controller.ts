import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';

export class PaymentController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await paymentService.getAll(req.query);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await paymentService.getById(req.params.id as string);
      res.json(item);
    } catch (err: any) {
      if (err.message === 'Payment not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await paymentService.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await paymentService.update(req.params.id as string, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
  
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await paymentService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async stkPush(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, amount, reference, description, bookingId, spaId } = req.body;
      if (!phoneNumber || !amount) {
        return res.status(400).json({ error: 'phoneNumber and amount are required' });
      }
      const { mpesaService } = await import('../services/mpesa.service');
      const { prisma } = await import('../database/prisma');
      
      let resolvedSpaId = spaId;
      if (!resolvedSpaId && bookingId) {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (booking) resolvedSpaId = booking.spaId;
      }

      const result = await mpesaService.initiateStkPush(phoneNumber, amount, reference || 'BeautyBooker', description || 'Spa Booking', bookingId, resolvedSpaId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async queryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { checkoutRequestId } = req.body;
      if (!checkoutRequestId) return res.status(400).json({ error: 'checkoutRequestId is required' });
      const { mpesaService } = await import('../services/mpesa.service');
      const result = await mpesaService.queryStatus(checkoutRequestId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async callback(req: Request, res: Response, next: NextFunction) {
    try {
      const { mpesaService } = await import('../services/mpesa.service');
      const result = await mpesaService.handleCallback(req.body);
      res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (err: any) {
      console.error('[M-Pesa Callback Error]', err.message);
      res.json({ ResultCode: 0, ResultDesc: 'Accepted' }); // Always return 200 to Safaricom
    }
  }
}

export const paymentController = new PaymentController();
