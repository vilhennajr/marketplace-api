import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IProductRepository } from '@domain/product/product.repository.interface';
import { ProductEntity } from '@domain/product/product.entity';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) return null;

    return ProductMapper.toDomain(product);
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (!product) return null;

    return ProductMapper.toDomain(product);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    isActive?: boolean;
    companyId?: string;
    categoryId?: string;
    search?: string;
  }): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: params.isActive,
        companyId: params.companyId,
        categoryId: params.categoryId,
        deletedAt: null,
        ...(params.search && {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { description: { contains: params.search, mode: 'insensitive' } },
          ],
        }),
      },
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => ProductMapper.toDomain(product));
  }

  async count(params: {
    isActive?: boolean;
    companyId?: string;
    categoryId?: string;
    search?: string;
  }): Promise<number> {
    return this.prisma.product.count({
      where: {
        isActive: params.isActive,
        companyId: params.companyId,
        categoryId: params.categoryId,
        deletedAt: null,
        ...(params.search && {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { description: { contains: params.search, mode: 'insensitive' } },
          ],
        }),
      },
    });
  }

  async save(product: ProductEntity): Promise<ProductEntity> {
    const data = ProductMapper.toPersistence(product);
    const created = await this.prisma.product.create({
      data,
    });

    return ProductMapper.toDomain(created);
  }

  async update(product: ProductEntity): Promise<ProductEntity> {
    const data = ProductMapper.toPersistence(product);
    const updated = await this.prisma.product.update({
      where: { id: data.id },
      data,
    });

    return ProductMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }
}
