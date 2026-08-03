import { classRepository } from '../repositories/class.repository';

export class ClassService {
  async getAll(filters?: any) {
    return classRepository.findMany(filters);
  }

  async getById(id: string) {
    const item = await classRepository.findById(id);
    if (!item) throw new Error('Class not found');
    return item;
  }

  async create(data: any) {
    return classRepository.create(data);
  }

  async update(id: string, data: any) {
    return classRepository.update(id, data);
  }
  
  async delete(id: string) {
    return classRepository.delete(id);
  }
}

export const classService = new ClassService();
