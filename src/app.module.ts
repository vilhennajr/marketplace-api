import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-redis-store';

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import cacheConfig from './config/cache.config';
import throttleConfig from './config/throttle.config';

import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './infrastructure/security/auth.module';
import { PublicModule } from './interfaces/http/public/public.module';
import { AdminModule } from './interfaces/http/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, cacheConfig, throttleConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('throttle.ttl'),
          limit: config.get('throttle.limit'),
        },
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        ({
          store: redisStore as any,
          host: configService.get('cache.host'),
          port: configService.get('cache.port'),
          ttl: configService.get('cache.ttl'),
        }) as any,
    }),
    InfrastructureModule,
    AuthModule,
    PublicModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
