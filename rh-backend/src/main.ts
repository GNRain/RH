// rh-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- ADD THIS BLOCK ---
  app.enableCors({
    origin: 'http://localhost:5173', // This is the origin of our React frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // --- END OF BLOCK ---

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();