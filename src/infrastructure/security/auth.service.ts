import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '@domain/user/user.repository.interface';
import { HashService } from './hash.service';
import { PrismaService } from '../database/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    private hashService: HashService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const isPasswordValid = await this.hashService.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });

    const roles = userRoles.map((ur) => ur.role.name);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.emailValue,
      roles,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.emailValue,
        name: user.name,
        roles,
      },
    };
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!tokenRecord || tokenRecord.isRevoked) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date() > tokenRecord.expiresAt) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Revoke old refresh token
      await this.prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { isRevoked: true },
      });

      // Get user roles
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true },
      });

      const roles = userRoles.map((ur) => ur.role.name);

      const jwtPayload: JwtPayload = {
        sub: user.id,
        email: user.emailValue,
        roles,
      };

      const newAccessToken = this.jwtService.sign(jwtPayload);
      const newRefreshToken = await this.generateRefreshToken(user.id);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }
}
