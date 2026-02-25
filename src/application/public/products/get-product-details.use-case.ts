import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProductRepository } from '@domain/product/product.repository.interface';

@Injectable()
export class GetProductDetailsUseCase {
  constructor(@Inject('IProductRepository') private productRepository: IProductRepository) {}

  async execute(slug: string) {
    const product = await this.productRepository.findBySlug(slug);

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      images: product.images,
      companyId: product.companyId,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
    };
  }
}
