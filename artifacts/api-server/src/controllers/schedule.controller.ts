import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma';

export class ScheduleController {
  // Therapist Schedules
  async getSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const therapistId = req.params.therapistId as string;
      const schedules = await prisma.therapistSchedule.findMany({
        where: { therapistId },
        orderBy: { dayOfWeek: 'asc' }
      });
      res.json(schedules);
    } catch (err) {
      next(err);
    }
  }

  async setSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const therapistId = req.params.therapistId as string;
      const { schedules } = req.body; // Array of { dayOfWeek, startTime, endTime, isWorking }

      // Validate therapist belongs to current tenant
      const therapist = await prisma.therapist.findFirst({
        where: { id: therapistId, spaId: req.tenantId }
      });
      if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

      // Replace existing schedules
      await prisma.$transaction(async (tx) => {
        await tx.therapistSchedule.deleteMany({ where: { therapistId } });
        if (schedules && schedules.length > 0) {
          await tx.therapistSchedule.createMany({
            data: schedules.map((s: any) => ({
              therapistId,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              isWorking: s.isWorking
            }))
          });
        }
      });

      const updated = await prisma.therapistSchedule.findMany({
        where: { therapistId },
        orderBy: { dayOfWeek: 'asc' }
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  // Time Off
  async getTimeOff(req: Request, res: Response, next: NextFunction) {
    try {
      const spaId = req.tenantId!;
      const timeOffList = await prisma.timeOff.findMany({
        where: { spaId },
        include: { therapist: { select: { id: true, name: true } } },
        orderBy: { startDate: 'asc' }
      });
      res.json(timeOffList);
    } catch (err) {
      next(err);
    }
  }

  async addTimeOff(req: Request, res: Response, next: NextFunction) {
    try {
      const spaId = req.tenantId!;
      const { therapistId, startDate, endDate, reason } = req.body;

      if (therapistId) {
        const therapist = await prisma.therapist.findFirst({
          where: { id: therapistId, spaId }
        });
        if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
      }

      const timeOff = await prisma.timeOff.create({
        data: {
          spaId,
          therapistId: therapistId || null,
          startDate,
          endDate,
          reason
        }
      });
      res.status(201).json(timeOff);
    } catch (err) {
      next(err);
    }
  }

  async deleteTimeOff(req: Request, res: Response, next: NextFunction) {
    try {
      const spaId = req.tenantId!;
      const id = req.params.id as string;

      const timeOff = await prisma.timeOff.findFirst({
        where: { id, spaId }
      });
      if (!timeOff) return res.status(404).json({ error: 'Time off not found' });

      await prisma.timeOff.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const scheduleController = new ScheduleController();
