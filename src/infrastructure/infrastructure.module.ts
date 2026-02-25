import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { UserRepository } from './repositories/user.repository';
import { CompanyRepository } from './repositories/company.repository';
import { ProductRepository } from './repositories/product.repository';
import { RoleRepository } from './repositories/role.repository';

const repositories = [
  {
    provide: 'IUserRepository',
    useClass: UserRepository,
  },
  {
    provide: 'ICompanyRepository',
    useClass: CompanyRepository,
  },
  {
    provide: 'IProductRepository',
    useClass: ProductRepository,
  },
  {
    provide: 'IRoleRepository',
    useClass: RoleRepository,
  },
];

@Module({
  providers: [PrismaService, ...repositories],
  exports: [PrismaService, ...repositories],
})
export class InfrastructureModule {}
