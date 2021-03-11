import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { requestListening } from './util/request.middleware';
import * as express from 'express';

const PORT = 5003;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(requestListening);
  app.setGlobalPrefix('/api');
  app.use('/', express.static('static'));
  await app.listen(PORT);
}
bootstrap();
