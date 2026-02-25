import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ICompanyRepository } from '@domain/company/company.repository.interface';
import { CompanyEntity } from '@domain/company/company.entity';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<CompanyEntity | null> {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) return null;

    return CompanyEntity.reconstitute({
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description || undefined,
      logo: company.logo || undefined,
      email: company.email || undefined,
      phone: company.phone || undefined,
      address: company.address || undefined,
      isActive: company.isActive,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      deletedAt: company.deletedAt || undefined,
    });
  }

  async findBySlug(slug: string): Promise<CompanyEntity | null> {
    const company = await this.prisma.company.findUnique({
      where: { slug },
    });

    if (!company) return null;

    return CompanyEntity.reconstitute({
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description || undefined,
      logo: company.logo || undefined,
      email: company.email || undefined,
      phone: company.phone || undefined,
      address: company.address || undefined,
      isActive: company.isActive,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      deletedAt: company.deletedAt || undefined,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<CompanyEntity[]> {
    const companies = await this.prisma.company.findMany({
      where: {
        isActive: params.isActive,
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

    return companies.map((company) =>
      CompanyEntity.reconstitute({
        id: company.id,
        name: company.name,
        slug: company.slug,
        description: company.description || undefined,
        logo: company.logo || undefined,
        email: company.email || undefined,
        phone: company.phone || undefined,
        address: company.address || undefined,
        isActive: company.isActive,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        deletedAt: company.deletedAt || undefined,
      }),
    );
  }

  async count(params: { isActive?: boolean; search?: string }): Promise<number> {
    return this.prisma.company.count({
      where: {
        isActive: params.isActive,
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

  async save(company: CompanyEntity): Promise<CompanyEntity> {
    const data = company.toJSON();
    const created = await this.prisma.company.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: data.logo,
        email: data.email,
        phone: data.phone,
        address: data.address,
        isActive: data.isActive,
      },
    });

    return CompanyEntity.reconstitute({
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: created.description || undefined,
      logo: created.logo || undefined,
      email: created.email || undefined,
      phone: created.phone || undefined,
      address: created.address || undefined,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      deletedAt: created.deletedAt || undefined,
    });
  }

  async update(company: CompanyEntity): Promise<CompanyEntity> {
    const data = company.toJSON();
    const updated = await this.prisma.company.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: data.logo,
        email: data.email,
        phone: data.phone,
        address: data.address,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
        deletedAt: data.deletedAt,
      },
    });

    return CompanyEntity.reconstitute({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description || undefined,
      logo: updated.logo || undefined,
      email: updated.email || undefined,
      phone: updated.phone || undefined,
      address: updated.address || undefined,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      deletedAt: updated.deletedAt || undefined,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({
      where: { id },
    });
  }
}
