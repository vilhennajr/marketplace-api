import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { PublicCompaniesController } from '@interfaces/http/public/companies.controller';
import { PublicProductsController } from '@interfaces/http/public/products.controller';
import { ListCompaniesUseCase } from '@application/public/companies/list-companies.use-case';
import { GetCompanyDetailsUseCase } from '@application/public/companies/get-company-details.use-case';
import { ListProductsUseCase } from '@application/public/products/list-products.use-case';
import { GetProductDetailsUseCase } from '@application/public/products/get-product-details.use-case';

@Module({
  imports: [InfrastructureModule],
  controllers: [PublicCompaniesController, PublicProductsController],
  providers: [
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
      provide: ListProductsUseCase,
      useFactory: (productRepository) => new ListProductsUseCase(productRepository),
      inject: ['IProductRepository'],
    },
    {
      provide: GetProductDetailsUseCase,
      useFactory: (productRepository) => new GetProductDetailsUseCase(productRepository),
      inject: ['IProductRepository'],
    },
  ],
})
export class PublicModule {}
