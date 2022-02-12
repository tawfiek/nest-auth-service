import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const SERVER_PORT = isNaN(+process?.env?.SERVER_PORT) ? +process.env : 3000;

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(SERVER_PORT);
}
bootstrap();
