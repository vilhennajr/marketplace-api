import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ListProductsUseCase } from '@application/public/products/list-products.use-case';
import { GetProductDetailsUseCase } from '@application/public/products/get-product-details.use-case';
import { PaginationQueryDto } from '@interfaces/dtos/pagination.dto';

@ApiTags('Public - Products')
@Controller('api/public/products')
@UseInterceptors(CacheInterceptor)
export class PublicProductsController {
  constructor(
    private listProductsUseCase: ListProductsUseCase,
    private getProductDetailsUseCase: GetProductDetailsUseCase,
  ) {}

  @Get()
  @CacheTTL(180) // 3 minutes
  @ApiOperation({ summary: 'List all active products' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiResponse({ status: 200, description: 'Products list' })
  async list(
    @Query() query: PaginationQueryDto,
    @Query('companyId') companyId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.listProductsUseCase.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
      companyId,
      categoryId,
    });
  }

  @Get(':slug')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get product details by slug' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getBySlug(@Param('slug') slug: string) {
    return this.getProductDetailsUseCase.execute(slug);
  }
}
