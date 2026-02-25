import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { IProductRepository } from '@domain/product/product.repository.interface';
import { Slug } from '@domain/shared/value-objects/slug.vo';
import { Money } from '@domain/shared/value-objects/money.vo';
import { Quantity } from '@domain/shared/value-objects/quantity.vo';

export interface UpdateProductInput {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: string[];
  categoryId?: string;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(@Inject('IProductRepository') private productRepository: IProductRepository) {}

  async execute(input: UpdateProductInput) {
    const product = await this.productRepository.findById(input.id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;

    if (input.slug !== undefined) {
      const slugOrError = Slug.create(input.slug);
      if (slugOrError.isFailure) {
        throw new BadRequestException(slugOrError.getErrorMessage());
      }
      updateData.slug = slugOrError.getValue();
    }

    if (input.price !== undefined) {
      const priceOrError = Money.create(input.price);
      if (priceOrError.isFailure) {
        throw new BadRequestException(priceOrError.getErrorMessage());
      }
      updateData.price = priceOrError.getValue();
    }

    if (input.stock !== undefined) {
      const stockOrError = Quantity.createStock(input.stock);
      if (stockOrError.isFailure) {
        throw new BadRequestException(stockOrError.getErrorMessage());
      }
      updateData.stock = stockOrError.getValue();
    }

    product.update(updateData);

    const updated = await this.productRepository.update(product);

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slugValue,
      description: updated.description,
      price: updated.priceValue,
      stock: updated.stockValue,
      images: updated.images,
      categoryId: updated.categoryId,
      companyId: updated.companyId,
      isActive: updated.isActive,
      updatedAt: updated.updatedAt,
    };
  }
}
