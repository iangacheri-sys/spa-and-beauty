import { productRepository } from '../repositories/product.repository';

export class ProductService {
  async getAll(filters?: any) {
    const where: any = {};
    if (filters?.spaId) where.spaId = filters.spaId;
    return productRepository.findMany(where);
  }

  async getById(id: string) {
    const item = await productRepository.findById(id);
    if (!item) throw new Error('Product not found');
    return item;
  }

  async create(data: any) {
    return productRepository.create(data);
  }

  async update(id: string, data: any) {
    return productRepository.update(id, data);
  }
  
  async delete(id: string) {
    return productRepository.delete(id);
  }
}

export const productService = new ProductService();
