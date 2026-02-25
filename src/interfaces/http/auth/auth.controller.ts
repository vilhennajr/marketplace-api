import { Controller, Post, Body, Get, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '@infrastructure/security/auth.service';
import { LoginDto, RefreshTokenDto } from '@interfaces/dtos/auth.dto';
import { RegisterUserDto } from '@interfaces/dtos/user.dto';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '@shared/decorators/current-user.decorator';
import { RegisterUserUseCase } from '@application/public/auth/register-user.use-case';
import { PrismaService } from '@infrastructure/database/prisma.service';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private registerUserUseCase: RegisterUserUseCase,
    private prisma: PrismaService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async register(@Body() registerDto: RegisterUserDto) {
    const result = await this.registerUserUseCase.execute({
      email: registerDto.email,
      name: registerDto.name,
      password: registerDto.password,
    });

    if (result.isFailure) {
      const error = result.getError();
      if (error.name === 'EntityAlreadyExistsError') {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    const user = result.getValue();

    const customerRole = await this.prisma.role.findUnique({
      where: { name: 'customer' },
    });

    if (customerRole) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: customerRole.id,
        },
      });
    }

    return this.authService.login(registerDto.email, registerDto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { message: 'Logout successful' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Current user information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() user: CurrentUserData) {
    return {
      id: user.userId,
      email: user.email,
      roles: user.roles,
    };
  }
}
