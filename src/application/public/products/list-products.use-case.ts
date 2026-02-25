import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '@domain/product/product.repository.interface';

export interface ListProductsInput {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  categoryId?: string;
}

@Injectable()
export class ListProductsUseCase {
  constructor(@Inject('IProductRepository') private productRepository: IProductRepository) {}

  async execute(input: ListProductsInput) {
    const page = input.page || 1;
    const limit = input.limit || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productRepository.findAll({
        skip,
        take: limit,
        isActive: true,
        search: input.search,
        companyId: input.companyId,
        categoryId: input.categoryId,
      }),
      this.productRepository.count({
        isActive: true,
        search: input.search,
        companyId: input.companyId,
        categoryId: input.categoryId,
      }),
    ]);

    return {
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        images: p.images,
        companyId: p.companyId,
        categoryId: p.categoryId,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
