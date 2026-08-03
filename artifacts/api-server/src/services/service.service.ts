import { serviceRepository } from '../repositories/service.repository';

export class ServiceService {
  async getAll(filters?: any) {
    // Only pass known Prisma where-clause fields
    const where: any = {};
    if (filters?.spaId) where.spaId = filters.spaId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive === 'true' || filters.isActive === true;
    return serviceRepository.findMany(where);
  }

  async getById(id: string) {
    const item = await serviceRepository.findById(id);
    if (!item) throw new Error('Service not found');
    return item;
  }

  async create(data: any) {
    return serviceRepository.create(data);
  }

  async update(id: string, data: any) {
    return serviceRepository.update(id, data);
  }
  
  async delete(id: string) {
    return serviceRepository.delete(id);
  }
}

export const serviceService = new ServiceService();
