import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { AdminCompaniesController } from '@interfaces/http/admin/companies.controller';
import { AdminProductsController } from '@interfaces/http/admin/products.controller';
import { AdminUsersController } from '@interfaces/http/admin/users.controller';
import { AdminRolesController } from '@interfaces/http/admin/roles.controller';
import { CreateCompanyUseCase } from '@application/admin/companies/create-company.use-case';
import { UpdateCompanyUseCase } from '@application/admin/companies/update-company.use-case';
import { ListCompaniesUseCase } from '@application/public/companies/list-companies.use-case';
import { GetCompanyDetailsUseCase } from '@application/public/companies/get-company-details.use-case';
import { CreateProductUseCase } from '@application/admin/products/create-product.use-case';
import { UpdateProductUseCase } from '@application/admin/products/update-product.use-case';
import { ListProductsUseCase } from '@application/public/products/list-products.use-case';
import { CreateUserUseCase } from '@application/admin/users/create-user.use-case';
import { UpdateUserUseCase } from '@application/admin/users/update-user.use-case';
import { ListUsersUseCase } from '@application/admin/users/list-users.use-case';
import { DeleteUserUseCase } from '@application/admin/users/delete-user.use-case';
import { CreateRoleUseCase } from '@application/admin/roles/create-role.use-case';
import { UpdateRoleUseCase } from '@application/admin/roles/update-role.use-case';
import { ListRolesUseCase } from '@application/admin/roles/list-roles.use-case';
import { DeleteRoleUseCase } from '@application/admin/roles/delete-role.use-case';
import { HashService } from '@infrastructure/security/hash.service';

@Module({
  imports: [InfrastructureModule],
  controllers: [AdminCompaniesController, AdminProductsController, AdminUsersController, AdminRolesController],
  providers: [
    HashService,
    {
      provide: CreateCompanyUseCase,
      useFactory: (companyRepository) => new CreateCompanyUseCase(companyRepository),
      inject: ['ICompanyRepository'],
    },
    {
      provide: UpdateCompanyUseCase,
      useFactory: (companyRepository) => new UpdateCompanyUseCase(companyRepository),
      inject: ['ICompanyRepository'],
    },
    {
      provide: ListCompaniesUseCase,
      useFactory: (companyRepository) => new ListCompaniesUseCase(companyRepository),
      inject: ['ICompanyRepository'],
    },
    {
      provide: GetCompanyDetailsUseCase,
      useFactory: (companyRepository) => new GetCompanyDetailsUseCase(companyRepository),
      inject: ['ICompanyRepository'],
    },
    {
      provide: CreateProductUseCase,
      useFactory: (productRepository) => new CreateProductUseCase(productRepository),
      inject: ['IProductRepository'],
    },
    {
      provide: UpdateProductUseCase,
      useFactory: (productRepository) => new UpdateProductUseCase(productRepository),
      inject: ['IProductRepository'],
    },
    {
      provide: ListProductsUseCase,
      useFactory: (productRepository) => new ListProductsUseCase(productRepository),
      inject: ['IProductRepository'],
    },
    {
      provide: CreateUserUseCase,
      useFactory: (userRepository, hashService) => new CreateUserUseCase(userRepository, hashService),
      inject: ['IUserRepository', HashService],
    },
    {
      provide: UpdateUserUseCase,
      useFactory: (userRepository, hashService) => new UpdateUserUseCase(userRepository, hashService),
      inject: ['IUserRepository', HashService],
    },
    {
      provide: ListUsersUseCase,
      useFactory: (userRepository) => new ListUsersUseCase(userRepository),
      inject: ['IUserRepository'],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (userRepository) => new DeleteUserUseCase(userRepository),
      inject: ['IUserRepository'],
    },
    {
      provide: CreateRoleUseCase,
      useFactory: (roleRepository) => new CreateRoleUseCase(roleRepository),
      inject: ['IRoleRepository'],
    },
    {
      provide: UpdateRoleUseCase,
      useFactory: (roleRepository) => new UpdateRoleUseCase(roleRepository),
      inject: ['IRoleRepository'],
    },
    {
      provide: ListRolesUseCase,
      useFactory: (roleRepository) => new ListRolesUseCase(roleRepository),
      inject: ['IRoleRepository'],
    },
    {
      provide: DeleteRoleUseCase,
      useFactory: (roleRepository) => new DeleteRoleUseCase(roleRepository),
      inject: ['IRoleRepository'],
    },
  ],
})
export class AdminModule {}
