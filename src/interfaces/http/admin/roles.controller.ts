import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { RolesGuard, Roles } from '@infrastructure/security/roles.guard';
import { CreateRoleUseCase } from '@application/admin/roles/create-role.use-case';
import { UpdateRoleUseCase } from '@application/admin/roles/update-role.use-case';
import { ListRolesUseCase } from '@application/admin/roles/list-roles.use-case';
import { DeleteRoleUseCase } from '@application/admin/roles/delete-role.use-case';
import { CreateRoleDto, UpdateRoleDto } from '@interfaces/dtos/role.dto';
import { IRoleRepository } from '@domain/role/role.repository.interface';
import { PrismaService } from '@infrastructure/database/prisma.service';

@ApiTags('Admin - Roles')
@Controller('api/admin/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminRolesController {
  constructor(
    private createRoleUseCase: CreateRoleUseCase,
    private updateRoleUseCase: UpdateRoleUseCase,
    private listRolesUseCase: ListRolesUseCase,
    private deleteRoleUseCase: DeleteRoleUseCase,
    @Inject('IRoleRepository') private roleRepository: IRoleRepository,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({ status: 200, description: 'Roles list' })
  async list() {
    return this.listRolesUseCase.execute();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role details' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getById(@Param('id') id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: { roleId: id },
      include: { user: true },
    });

    return {
      ...role.toJSON(),
      usersCount: userRoles.length,
    };
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  @ApiResponse({ status: 409, description: 'Role with this name already exists' })
  @ApiResponse({ status: 400, description: 'Invalid role data' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const result = await this.createRoleUseCase.execute({
      name: createRoleDto.name,
      description: createRoleDto.description,
    });

    if (result.isFailure) {
      const error = result.getError();
      if (error.name === 'EntityAlreadyExistsError') {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return result.getValue().toJSON();
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const result = await this.updateRoleUseCase.execute({
      id,
      ...updateRoleDto,
    });

    if (result.isFailure) {
      const error = result.getError();
      if (error.name === 'EntityNotFoundError') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error.name === 'EntityAlreadyExistsError') {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return result.getValue().toJSON();
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete system role' })
  async delete(@Param('id') id: string) {
    const result = await this.deleteRoleUseCase.execute(id);

    if (result.isFailure) {
      const error = result.getError();
      if (error.name === 'EntityNotFoundError') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error.name === 'ValidationError') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return { message: 'Role deleted successfully' };
  }

  @Get(':id/users')
  @Roles('admin')
  @ApiOperation({ summary: 'Get users with this role' })
  @ApiResponse({ status: 200, description: 'Users list' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getUsersByRole(@Param('id') id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: { roleId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      role: role.toJSON(),
      users: userRoles.map((ur) => ur.user),
    };
  }
}
