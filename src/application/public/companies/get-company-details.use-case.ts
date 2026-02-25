/**
 * Get Company Details Use Case
 * Follows: Single Responsibility, Dependency Inversion (SOLID)
 * Port in Hexagonal Architecture
 */

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ICompanyRepository } from '@domain/company/company.repository.interface';
import { IUseCase } from '@shared/core/use-case.interface';

export interface GetCompanyDetailsInput {
  slug: string;
}

export interface GetCompanyDetailsOutput {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
}

@Injectable()
export class GetCompanyDetailsUseCase implements IUseCase<
  GetCompanyDetailsInput,
  GetCompanyDetailsOutput
> {
  constructor(@Inject('ICompanyRepository') private readonly companyRepository: ICompanyRepository) {}

  async execute(input: GetCompanyDetailsInput): Promise<GetCompanyDetailsOutput> {
    const company = await this.companyRepository.findBySlug(input.slug);

    if (!company || !company.isActive) {
      throw new NotFoundException(`Company with slug '${input.slug}' not found`);
    }

    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      logo: company.logo,
      email: company.email,
      phone: company.phone,
      address: company.address,
    };
  }
}
