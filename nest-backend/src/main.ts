import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 8000;
  
  // Enable CORS - matching FastAPI backend configuration
  app.enableCors({
    origin: '*', // Configure appropriately for production
    credentials: true,
    methods: ['*'],
    allowedHeaders: ['*'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set global prefix for module routes only, excluding explicitly listed public endpoints
  // NOTE: Wildcards like 'analysis/status/*' do NOT work here; need explicit route info objects.
  app.setGlobalPrefix('api', { 
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'analyze', method: RequestMethod.POST },
      { path: 'dockerize', method: RequestMethod.POST },
      { path: 'status/:taskId', method: RequestMethod.GET },
      { path: 'debug/analyses', method: RequestMethod.GET },
      { path: 'analysis/status/:taskId', method: RequestMethod.GET },
      { path: 'analysis/result/:taskId', method: RequestMethod.GET },
    ],
  });

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
