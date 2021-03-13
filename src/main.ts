import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { requestListening } from './util/request.middleware';
import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

const PORT = 5003;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(requestListening);
  app.setGlobalPrefix('/api');
  // app.use('/*', express.static('static'));
  app.useStaticAssets('../static')
  await app.listen(PORT);
}
bootstrap();
