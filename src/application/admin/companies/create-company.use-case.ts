/**
 * Create Company Use Case
 * Follows: Single Responsibility, Dependency Inversion (SOLID)
 * Port in Hexagonal Architecture
 */

import { Injectable, ConflictException, Logger, Inject } from '@nestjs/common';
import { ICompanyRepository } from '@domain/company/company.repository.interface';
import { CompanyEntity } from '@domain/company/company.entity';
import { IUseCase } from '@shared/core/use-case.interface';

export interface CreateCompanyInput {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CreateCompanyOutput {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class CreateCompanyUseCase implements IUseCase<CreateCompanyInput, CreateCompanyOutput> {
  private readonly logger = new Logger(CreateCompanyUseCase.name);

  constructor(@Inject('ICompanyRepository') private readonly companyRepository: ICompanyRepository) {}

  async execute(input: CreateCompanyInput): Promise<CreateCompanyOutput> {
    this.logger.log(`Creating company: ${input.name}`);

    const existing = await this.companyRepository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictException(`Company with slug '${input.slug}' already exists`);
    }

    const company = CompanyEntity.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      logo: input.logo,
      email: input.email,
      phone: input.phone,
      address: input.address,
      isActive: true,
    });

    const saved = await this.companyRepository.save(company);

    this.logger.log(`Company created successfully: ${saved.id}`);

    return {
      id: saved.id,
      name: saved.name,
      slug: saved.slug,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
    };
  }
}
