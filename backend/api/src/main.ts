import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global doğrulama
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // API önek
  app.setGlobalPrefix('api');
  
  // CORS yapılandırması
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Request-ID, x-request-id',
  });
  
  await app.listen(3000);
  console.log(`Uygulama şu adreste çalışıyor: http://localhost:3000/api`);
}
bootstrap();