import { paymentRepository } from '../repositories/payment.repository';

export class PaymentService {
  async getAll(filters?: any) {
    return paymentRepository.findMany(filters);
  }

  async getById(id: string) {
    const item = await paymentRepository.findById(id);
    if (!item) throw new Error('Payment not found');
    return item;
  }

  async create(data: any) {
    return paymentRepository.create(data);
  }

  async update(id: string, data: any) {
    return paymentRepository.update(id, data);
  }
  
  async delete(id: string) {
    return paymentRepository.delete(id);
  }
}

export const paymentService = new PaymentService();
