/**
 * List Companies Use Case
 * Follows: Single Responsibility, Dependency Inversion (SOLID)
 * Port in Hexagonal Architecture
 */

import { Injectable, Inject } from '@nestjs/common';
import { ICompanyRepository } from '@domain/company/company.repository.interface';
import { IUseCase } from '@shared/core/use-case.interface';

export interface ListCompaniesInput {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListCompaniesOutput {
  data: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ListCompaniesUseCase implements IUseCase<ListCompaniesInput, ListCompaniesOutput> {
  constructor(@Inject('ICompanyRepository') private readonly companyRepository: ICompanyRepository) {}

  async execute(input: ListCompaniesInput): Promise<ListCompaniesOutput> {
    const page = input.page || 1;
    const limit = input.limit || 10;
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      this.companyRepository.findAll({
        skip,
        take: limit,
        isActive: true,
        search: input.search,
      }),
      this.companyRepository.count({
        isActive: true,
        search: input.search,
      }),
    ]);

    return {
      data: companies.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        logo: c.logo,
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
