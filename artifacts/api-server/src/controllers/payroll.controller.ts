import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma';

export class PayrollController {
  
  // Get all commission records for a spa, optionally grouped by therapist
  async getCommissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { spaId, status, therapistId } = req.query;
      
      const where: any = {};
      if (spaId) where.spaId = spaId as string;
      if (status) where.status = status as string;
      if (therapistId) where.therapistId = therapistId as string;

      const records = await prisma.commissionRecord.findMany({
        where,
        include: {
          therapist: true,
          booking: {
            include: { service: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(records);
    } catch (err) {
      next(err);
    }
  }

  // Mark a specific commission record or multiple records as PAID
  async markAsPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body; // Array of commission record IDs
      
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: 'Provide an array of commission record ids' });
      }

      await prisma.commissionRecord.updateMany({
        where: { id: { in: ids } },
        data: { status: 'PAID' }
      });

      res.json({ success: true, message: `Marked ${ids.length} records as PAID.` });
    } catch (err) {
      next(err);
    }
  }

  // Get aggregated payroll summary (Total Pending vs Total Paid) per therapist
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { spaId } = req.query;
      if (!spaId) return res.status(400).json({ error: 'spaId is required' });

      const records = await prisma.commissionRecord.findMany({
        where: { spaId: spaId as string },
        include: { therapist: true }
      });

      const summary: Record<string, { therapistId: string, name: string, pending: number, paid: number }> = {};

      for (const r of records) {
        if (!summary[r.therapistId]) {
          summary[r.therapistId] = {
            therapistId: r.therapistId,
            name: r.therapist?.name || 'Unknown',
            pending: 0,
            paid: 0
          };
        }
        if (r.status === 'PENDING') summary[r.therapistId].pending += r.amount;
        if (r.status === 'PAID') summary[r.therapistId].paid += r.amount;
      }

      res.json(Object.values(summary));
    } catch (err) {
      next(err);
    }
  }
}

export const payrollController = new PayrollController();
