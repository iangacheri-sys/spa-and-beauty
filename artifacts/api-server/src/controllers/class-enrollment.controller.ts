import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ClassEnrollmentController {
  async enroll(req: Request, res: Response, next: NextFunction) {
    try {
      const classId = req.params.id as string;
      const user = (req as any).user;
      const userId = user.id;

      // Ensure class exists
      const trainingClass = await prisma.trainingClass.findUnique({
        where: { id: classId },
        include: { enrolled: true }
      });

      if (!trainingClass) {
        return res.status(404).json({ error: 'Class not found' });
      }

      // Check if already enrolled or waitlisted
      const existing = trainingClass.enrolled.find(e => e.userId === userId);
      if (existing) {
        return res.status(400).json({ error: `You are already ${existing.status} for this class` });
      }

      const currentEnrolledCount = trainingClass.enrolled.filter(e => e.status === 'enrolled').length;
      const status = currentEnrolledCount < trainingClass.capacity ? 'enrolled' : 'waitlist';

      const enrollment = await prisma.classEnrollment.create({
        data: {
          classId,
          userId,
          status,
        }
      });

      res.status(201).json(enrollment);
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const classId = req.params.id as string;
      const user = (req as any).user;
      const userId = user.id;

      const enrollment = await prisma.classEnrollment.findFirst({
        where: { classId, userId }
      });

      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      await prisma.classEnrollment.delete({
        where: { id: enrollment.id }
      });

      // If they were enrolled, promote the next waitlist person
      if (enrollment.status === 'enrolled') {
        const nextWaitlist = await prisma.classEnrollment.findFirst({
          where: { classId, status: 'waitlist' },
          orderBy: { registrationDate: 'asc' }
        });

        if (nextWaitlist) {
          await prisma.classEnrollment.update({
            where: { id: nextWaitlist.id },
            data: { status: 'enrolled' }
          });
        }
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const classEnrollmentController = new ClassEnrollmentController();
