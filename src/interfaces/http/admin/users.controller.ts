import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Inject,
  HttpException,
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { RolesGuard, Roles } from '@infrastructure/security/roles.guard';
import { CreateUserUseCase } from '@application/admin/users/create-user.use-case';
import { UpdateUserUseCase } from '@application/admin/users/update-user.use-case';
import { ListUsersUseCase } from '@application/admin/users/list-users.use-case';
import { DeleteUserUseCase } from '@application/admin/users/delete-user.use-case';
import { CreateUserDto, UpdateUserDto, AssignRolesDto } from '@interfaces/dtos/user.dto';
import { PaginationQueryDto } from '@interfaces/dtos/pagination.dto';
import { IUserRepository } from '@domain/user/user.repository.interface';
import { PrismaService } from '@infrastructure/database/prisma.service';

@ApiTags('Admin - Users')
@Controller('api/admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminUsersController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private listUsersUseCase: ListUsersUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
    @Inject('IUserRepository') private userRepository: IUserRepository,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Users list' })
  async list(
    @Query() query: PaginationQueryDto,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.listUsersUseCase.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isActive,
    });
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getById(@Param('id') id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: id },
      include: { role: true },
    });

    const userData = user.toJSON();
    return {
      ...userData,
      roles: userRoles.map((ur) => ur.role.name),
    };
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid user data' })
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.createUserUseCase.execute({
      email: createUserDto.email,
      name: createUserDto.name,
      password: createUserDto.password,
      roles: createUserDto.roles || ['customer'],
      isActive: createUserDto.isActive ?? true,
    });

    if (result.isFailure) {
      const error = result.getError();
      if (error.name === 'EntityAlreadyExistsError') {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    const user = result.getValue();

    if (createUserDto.roles && createUserDto.roles.length > 0) {
      await this.assignRolesToUser(user.id, createUserDto.roles);
    }

    return user.toJSON();
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.updateUserUseCase.execute({
      id,
      ...updateUserDto,
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
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: string) {
    const result = await this.deleteUserUseCase.execute(id);

    if (result.isFailure) {
      const error = result.getError();
      if (error.name === 'EntityNotFoundError') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return { message: 'User deleted successfully' };
  }

  @Post(':id/roles')
  @Roles('admin')
  @ApiOperation({ summary: 'Assign roles to user' })
  @ApiResponse({ status: 200, description: 'Roles assigned' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async assignRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    });

    await this.assignRolesToUser(id, assignRolesDto.roles);

    return { message: 'Roles assigned successfully' };
  }

  @Get(':id/roles')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponse({ status: 200, description: 'User roles' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getRoles(@Param('id') id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: id },
      include: { role: true },
    });

    return {
      userId: id,
      roles: userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      })),
    };
  }

  private async assignRolesToUser(userId: string, roleNames: string[]) {
    for (const roleName of roleNames) {
      const role = await this.prisma.role.findUnique({
        where: { name: roleName },
      });

      if (role) {
        await this.prisma.userRole.upsert({
          where: {
            userId_roleId: {
              userId,
              roleId: role.id,
            },
          },
          update: {},
          create: {
            userId,
            roleId: role.id,
          },
        });
      }
    }
  }
}
