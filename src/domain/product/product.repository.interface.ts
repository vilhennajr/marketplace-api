import { ProductEntity } from './product.entity';

export interface IProductRepository {
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findAll(params: {
    skip?: number;
    take?: number;
    isActive?: boolean;
    companyId?: string;
    categoryId?: string;
    search?: string;
  }): Promise<ProductEntity[]>;
  count(params: {
    isActive?: boolean;
    companyId?: string;
    categoryId?: string;
    search?: string;
  }): Promise<number>;
  save(product: ProductEntity): Promise<ProductEntity>;
  update(product: ProductEntity): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
}
