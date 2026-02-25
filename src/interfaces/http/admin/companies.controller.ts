import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { RolesGuard, Roles } from '@infrastructure/security/roles.guard';
import { CreateCompanyUseCase } from '@application/admin/companies/create-company.use-case';
import { UpdateCompanyUseCase } from '@application/admin/companies/update-company.use-case';
import { ListCompaniesUseCase } from '@application/public/companies/list-companies.use-case';
import { GetCompanyDetailsUseCase } from '@application/public/companies/get-company-details.use-case';
import { CreateCompanyDto, UpdateCompanyDto } from '@interfaces/dtos/company.dto';
import { PaginationQueryDto } from '@interfaces/dtos/pagination.dto';
import { ICompanyRepository } from '@domain/company/company.repository.interface';

@ApiTags('Admin - Companies')
@Controller('api/admin/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminCompaniesController {
  constructor(
    private createCompanyUseCase: CreateCompanyUseCase,
    private updateCompanyUseCase: UpdateCompanyUseCase,
    private listCompaniesUseCase: ListCompaniesUseCase,
    private getCompanyDetailsUseCase: GetCompanyDetailsUseCase,
    @Inject('ICompanyRepository') private companyRepository: ICompanyRepository,
  ) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List all companies (admin)' })
  @ApiResponse({ status: 200, description: 'Companies list' })
  async list(@Query() query: PaginationQueryDto) {
    return this.listCompaniesUseCase.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company details' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getById(@Param('id') id: string) {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    return company.toJSON();
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create new company' })
  @ApiResponse({ status: 201, description: 'Company created' })
  @ApiResponse({ status: 409, description: 'Company with this slug already exists' })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.createCompanyUseCase.execute(createCompanyDto);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, description: 'Company updated' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.updateCompanyUseCase.execute({
      id,
      ...updateCompanyDto,
    });
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: 200, description: 'Company deleted' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async delete(@Param('id') id: string) {
    await this.companyRepository.delete(id);
    return { message: 'Company deleted successfully' };
  }

  @Put(':id/activate')
  @Roles('admin')
  @ApiOperation({ summary: 'Activate company' })
  @ApiResponse({ status: 200, description: 'Company activated' })
  async activate(@Param('id') id: string) {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    company.activate();
    await this.companyRepository.update(company);
    return { message: 'Company activated' };
  }

  @Put(':id/deactivate')
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate company' })
  @ApiResponse({ status: 200, description: 'Company deactivated' })
  async deactivate(@Param('id') id: string) {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    company.deactivate();
    await this.companyRepository.update(company);
    return { message: 'Company deactivated' };
  }
}
