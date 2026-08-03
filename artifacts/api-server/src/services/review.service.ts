import { reviewRepository } from '../repositories/review.repository';

export class ReviewService {
  async getAll(filters?: any) {
    return reviewRepository.findMany(filters);
  }

  async getById(id: string) {
    const item = await reviewRepository.findById(id);
    if (!item) throw new Error('Review not found');
    return item;
  }

  async create(data: any) {
    return reviewRepository.create(data);
  }

  async update(id: string, data: any) {
    return reviewRepository.update(id, data);
  }
  
  async delete(id: string) {
    return reviewRepository.delete(id);
  }
}

export const reviewService = new ReviewService();
