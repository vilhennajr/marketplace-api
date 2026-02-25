import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { AuthService } from '@infrastructure/security/auth.service';
import { HashService } from '@infrastructure/security/hash.service';
import { JwtStrategy } from '@infrastructure/security/jwt.strategy';
import { AuthController } from '@interfaces/http/auth/auth.controller';
import { RegisterUserUseCase } from '@application/public/auth/register-user.use-case';

@Module({
  imports: [
    InfrastructureModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    HashService,
    JwtStrategy,
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepository, hashService) => new RegisterUserUseCase(userRepository, hashService),
      inject: ['IUserRepository', HashService],
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, HashService],
})
export class AuthModule {}
