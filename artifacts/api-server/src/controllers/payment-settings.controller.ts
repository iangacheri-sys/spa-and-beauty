import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma';

export class PaymentSettingsController {
  
  // GET /api/settings/payment (Private: used by Spa Admin)
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const spaId = (req as any).user?.spaId;
      if (!spaId) return res.status(403).json({ error: 'Not associated with a spa' });

      let settings = await prisma.spaPaymentSettings.findUnique({
        where: { spaId }
      });

      if (!settings) {
        settings = await prisma.spaPaymentSettings.create({
          data: { spaId }
        });
      }

      res.json(settings);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/settings/payment (Private: used by Spa Admin)
  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const spaId = (req as any).user?.spaId;
      if (!spaId) return res.status(403).json({ error: 'Not associated with a spa' });

      const data = req.body;
      
      const settings = await prisma.spaPaymentSettings.upsert({
        where: { spaId },
        update: {
          activeProvider: data.activeProvider,
          mpesaPaybillNumber: data.mpesaPaybillNumber,
          mpesaAccountRef: data.mpesaAccountRef,
          mpesaTillNumber: data.mpesaTillNumber,
          mpesaPochiNumber: data.mpesaPochiNumber,
          instructions: data.instructions
        },
        create: {
          spaId,
          activeProvider: data.activeProvider,
          mpesaPaybillNumber: data.mpesaPaybillNumber,
          mpesaAccountRef: data.mpesaAccountRef,
          mpesaTillNumber: data.mpesaTillNumber,
          mpesaPochiNumber: data.mpesaPochiNumber,
          instructions: data.instructions
        }
      });

      res.json(settings);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/spas/:spaId/payment-settings (Public: used by Mobile App checkout)
  async getPublicSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { spaId } = req.params;
      
      const settings = await prisma.spaPaymentSettings.findUnique({
        where: { spaId }
      });

      if (!settings) {
        return res.status(404).json({ error: 'Payment settings not configured for this spa' });
      }

      // Return only the necessary public information for checkout
      res.json({
        activeProvider: settings.activeProvider,
        instructions: settings.instructions,
        // we expose the numbers so the UI can format the specific instructions if needed
        mpesaPaybillNumber: settings.activeProvider === 'MPESA_PAYBILL' ? settings.mpesaPaybillNumber : null,
        mpesaAccountRef: settings.activeProvider === 'MPESA_PAYBILL' ? settings.mpesaAccountRef : null,
        mpesaTillNumber: settings.activeProvider === 'MPESA_TILL' ? settings.mpesaTillNumber : null,
        mpesaPochiNumber: settings.activeProvider === 'MPESA_POCHI' ? settings.mpesaPochiNumber : null,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const paymentSettingsController = new PaymentSettingsController();
