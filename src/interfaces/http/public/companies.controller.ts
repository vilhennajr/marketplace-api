/**
 * Public Companies Controller
 * Adapter in Hexagonal Architecture
 * Translates HTTP requests to use case calls
 */

import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ListCompaniesUseCase } from '@application/public/companies/list-companies.use-case';
import { GetCompanyDetailsUseCase } from '@application/public/companies/get-company-details.use-case';
import { PaginationQueryDto } from '@interfaces/dtos/pagination.dto';

@ApiTags('Public - Companies')
@Controller('api/public/companies')
@UseInterceptors(CacheInterceptor)
export class PublicCompaniesController {
  constructor(
    private readonly listCompaniesUseCase: ListCompaniesUseCase,
    private readonly getCompanyDetailsUseCase: GetCompanyDetailsUseCase,
  ) {}

  @Get()
  @CacheTTL(300) // 5 minutes
  @ApiOperation({ summary: 'List all active companies' })
  @ApiResponse({ status: 200, description: 'Companies list' })
  async list(@Query() query: PaginationQueryDto) {
    return this.listCompaniesUseCase.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  @Get(':slug')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get company details by slug' })
  @ApiResponse({ status: 200, description: 'Company details' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getBySlug(@Param('slug') slug: string) {
    return this.getCompanyDetailsUseCase.execute({ slug });
  }
}
