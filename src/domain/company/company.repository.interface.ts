import { CompanyEntity } from './company.entity';

export interface ICompanyRepository {
  findById(id: string): Promise<CompanyEntity | null>;
  findBySlug(slug: string): Promise<CompanyEntity | null>;
  findAll(params: {
    skip?: number;
    take?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<CompanyEntity[]>;
  count(params: { isActive?: boolean; search?: string }): Promise<number>;
  save(company: CompanyEntity): Promise<CompanyEntity>;
  update(company: CompanyEntity): Promise<CompanyEntity>;
  delete(id: string): Promise<void>;
}
