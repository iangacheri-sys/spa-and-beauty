import { therapistRepository } from '../repositories/therapist.repository';
import { prisma } from '../database/prisma';
import bcrypt from 'bcryptjs';

export class TherapistService {
  async getAll(filters?: any) {
    const where: any = {};
    if (filters?.spaId) where.spaId = filters.spaId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive === 'true' || filters.isActive === true;
    return therapistRepository.findMany(where);
  }

  async getById(id: string) {
    const item = await therapistRepository.findById(id);
    if (!item) throw new Error('Therapist not found');
    return item;
  }

  async create(data: any) {
    if (data.phone && data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Use transaction to ensure both records are created
      return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: data.name,
            phone: data.phone,
            password: hashedPassword,
            role: 'THERAPIST',
          }
        });
        
        return tx.therapist.create({
          data: {
            spaId: data.spaId,
            userId: user.id,
            name: data.name,
            bio: data.bio || "",
            specialties: data.specialties || [],
            isActive: true,
          }
        });
      });
    }

    return therapistRepository.create(data);
  }

  async update(id: string, data: any) {
    return therapistRepository.update(id, data);
  }
  
  async delete(id: string) {
    return therapistRepository.delete(id);
  }
}

export const therapistService = new TherapistService();
