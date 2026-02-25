/**
 * Create Product Use Case
 * Follows: Single Responsibility, Dependency Inversion (SOLID)
 * Port in Hexagonal Architecture
 * Uses Result Pattern for error handling (no exceptions in domain layer)
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { IProductRepository } from '@domain/product/product.repository.interface';
import { ProductEntity } from '@domain/product/product.entity';
import { IUseCase } from '@shared/core/use-case.interface';
import { Result } from '@shared/core/result';
import { EntityAlreadyExistsError } from '@shared/core/domain-error';

export interface CreateProductInput {
  name: string;
  slugText: string;
  description?: string;
  priceAmount: number;
  stockAmount: number;
  images?: string[];
  categoryId?: string;
  companyId: string;
}

export interface CreateProductOutput {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class CreateProductUseCase implements IUseCase<
  CreateProductInput,
  Result<CreateProductOutput, Error>
> {
  private readonly logger = new Logger(CreateProductUseCase.name);

  constructor(@Inject('IProductRepository') private readonly productRepository: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<Result<CreateProductOutput, Error>> {
    this.logger.log(`Creating product: ${input.name}`);

    // Check if slug already exists
    const existing = await this.productRepository.findBySlug(input.slugText);
    if (existing) {
      return Result.fail(new EntityAlreadyExistsError('Product', 'slug', input.slugText));
    }

    // Create product entity with Value Objects
    const productOrError = ProductEntity.create({
      name: input.name,
      slugText: input.slugText,
      description: input.description,
      priceAmount: input.priceAmount,
      stockAmount: input.stockAmount,
      images: input.images || [],
      categoryId: input.categoryId,
      companyId: input.companyId,
      isActive: true,
    });

    if (productOrError.isFailure) {
      return Result.fail(productOrError.getError());
    }

    const product = productOrError.getValue();
    const saved = await this.productRepository.save(product);

    this.logger.log(`Product created successfully: ${saved.id}`);

    return Result.ok({
      id: saved.id,
      name: saved.name,
      slug: saved.slugValue,
      price: saved.priceValue,
      stock: saved.stockValue,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
    });
  }
}
