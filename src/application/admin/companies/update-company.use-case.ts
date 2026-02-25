/**
 * Update Company Use Case
 * Follows: Single Responsibility, Dependency Inversion (SOLID)
 * Port in Hexagonal Architecture
 */

import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { ICompanyRepository } from '@domain/company/company.repository.interface';
import { IUseCase } from '@shared/core/use-case.interface';

export interface UpdateCompanyInput {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCompanyOutput {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  updatedAt: Date;
}

@Injectable()
export class UpdateCompanyUseCase implements IUseCase<UpdateCompanyInput, UpdateCompanyOutput> {
  private readonly logger = new Logger(UpdateCompanyUseCase.name);

  constructor(@Inject('ICompanyRepository') private readonly companyRepository: ICompanyRepository) {}

  async execute(input: UpdateCompanyInput): Promise<UpdateCompanyOutput> {
    this.logger.log(`Updating company: ${input.id}`);

    const company = await this.companyRepository.findById(input.id);
    if (!company) {
      throw new NotFoundException(`Company with ID '${input.id}' not found`);
    }

    company.update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      logo: input.logo,
      email: input.email,
      phone: input.phone,
      address: input.address,
    });

    const updated = await this.companyRepository.update(company);

    this.logger.log(`Company updated successfully: ${updated.id}`);

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      isActive: updated.isActive,
      updatedAt: updated.updatedAt,
    };
  }
}
