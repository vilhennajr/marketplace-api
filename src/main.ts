import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@shared/filters/all-exceptions.filter';
import { LoggingInterceptor } from '@shared/interceptors/logging.interceptor';
import { TransformInterceptor } from '@shared/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());

  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Marketplace API')
    .setDescription(
      'API RESTful para marketplace com arquitetura DDD e Hexagonal. ' +
        'Possui dois contextos: Público (navegação livre) e Administrativo (autenticação obrigatória).',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'Endpoints de autenticação')
    .addTag('Public - Companies', 'Endpoints públicos de empresas')
    .addTag('Public - Products', 'Endpoints públicos de produtos')
    .addTag('Admin - Companies', 'Gestão administrativa de empresas')
    .addTag('Admin - Products', 'Gestão administrativa de produtos')
    .addTag('Admin - Users', 'Gestão administrativa de usuários')
    .addTag('Admin - Roles', 'Gestão administrativa de roles/permissões')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.marketplace.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Marketplace API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`
    🚀 Application is running on: http://localhost:${port}
    📚 Swagger Docs: http://localhost:${port}/api/docs
    
    📦 Public API:
       - Companies: http://localhost:${port}/api/public/companies
       - Products: http://localhost:${port}/api/public/products
    
    🔐 Admin API:
       - Companies: http://localhost:${port}/api/admin/companies
       - Products: http://localhost:${port}/api/admin/products
    
    🔑 Auth: http://localhost:${port}/api/auth/login
    
    🏛️ Architecture: DDD + Hexagonal
    🛡️ Security: JWT + RBAC
    ⚡ Cache: Redis
    🗄️ Database: PostgreSQL (Render)
  `);
}

bootstrap();
