import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { RolesGuard, Roles } from '@infrastructure/security/roles.guard';
import { CreateProductUseCase } from '@application/admin/products/create-product.use-case';
import { UpdateProductUseCase } from '@application/admin/products/update-product.use-case';
import { ListProductsUseCase } from '@application/public/products/list-products.use-case';
import { CreateProductDto, UpdateProductDto } from '@interfaces/dtos/product.dto';
import { PaginationQueryDto } from '@interfaces/dtos/pagination.dto';
import { IProductRepository } from '@domain/product/product.repository.interface';

@ApiTags('Admin - Products')
@Controller('api/admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminProductsController {
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private updateProductUseCase: UpdateProductUseCase,
    private listProductsUseCase: ListProductsUseCase,
    @Inject('IProductRepository') private productRepository: IProductRepository,
  ) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List all products (admin)' })
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

  @Get(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getById(@Param('id') id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product.toJSON();
  }

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 409, description: 'Product with this slug already exists' })
  @ApiResponse({ status: 400, description: 'Invalid product data' })
  async create(@Body() createProductDto: CreateProductDto) {
    const result = await this.createProductUseCase.execute({
      name: createProductDto.name,
      slugText: createProductDto.slug,
      description: createProductDto.description,
      priceAmount: createProductDto.price,
      stockAmount: createProductDto.stock,
      images: createProductDto.images,
      categoryId: createProductDto.categoryId,
      companyId: createProductDto.companyId,
    });

    if (result.isFailure) {
      const error = result.getError();
      // Map domain errors to HTTP status codes
      if (error.name === 'EntityAlreadyExistsError') {
        throw new Error(error.message); // NestJS will handle this as 400
      }
      throw new Error(error.message);
    }

    return result.getValue();
  }

  @Put(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.updateProductUseCase.execute({
      id,
      ...updateProductDto,
    });
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async delete(@Param('id') id: string) {
    await this.productRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }

  @Put(':id/activate')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Activate product' })
  @ApiResponse({ status: 200, description: 'Product activated' })
  async activate(@Param('id') id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    product.activate();
    await this.productRepository.update(product);
    return { message: 'Product activated' };
  }

  @Put(':id/deactivate')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Deactivate product' })
  @ApiResponse({ status: 200, description: 'Product deactivated' })
  async deactivate(@Param('id') id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    product.deactivate();
    await this.productRepository.update(product);
    return { message: 'Product deactivated' };
  }
}
