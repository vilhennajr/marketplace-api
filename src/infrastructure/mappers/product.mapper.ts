import { Product as PrismaProduct } from '@prisma/client';
import { ProductEntity } from '@domain/product/product.entity';
import { Money } from '@domain/shared/value-objects/money.vo';
import { Slug } from '@domain/shared/value-objects/slug.vo';
import { Quantity } from '@domain/shared/value-objects/quantity.vo';

export class ProductMapper {
  static toDomain(prismaProduct: PrismaProduct): ProductEntity {
    const slugOrError = Slug.create(prismaProduct.slug);
    if (slugOrError.isFailure) {
      throw new Error(`Invalid slug in database: ${slugOrError.getErrorMessage()}`);
    }

    const priceOrError = Money.create(Number(prismaProduct.price));
    if (priceOrError.isFailure) {
      throw new Error(`Invalid price in database: ${priceOrError.getErrorMessage()}`);
    }

    const stockOrError = Quantity.create(prismaProduct.stock);
    if (stockOrError.isFailure) {
      throw new Error(`Invalid stock in database: ${stockOrError.getErrorMessage()}`);
    }

    return ProductEntity.reconstitute({
      id: prismaProduct.id,
      name: prismaProduct.name,
      slug: slugOrError.getValue(),
      description: prismaProduct.description || undefined,
      price: priceOrError.getValue(),
      stock: stockOrError.getValue(),
      images: prismaProduct.images,
      categoryId: prismaProduct.categoryId || undefined,
      companyId: prismaProduct.companyId,
      isActive: prismaProduct.isActive,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
      deletedAt: prismaProduct.deletedAt || undefined,
    });
  }


  static toPersistence(product: ProductEntity) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slugValue, // Extract primitive from Value Object
      description: product.description,
      price: product.priceValue, // Extract primitive from Value Object
      stock: product.stockValue, // Extract primitive from Value Object
      images: product.images,
      categoryId: product.categoryId,
      companyId: product.companyId,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
    };
  }
}
