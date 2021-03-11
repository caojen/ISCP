import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { requestListening } from './util/request.middleware';

const PORT = 5003;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(requestListening);
  app.setGlobalPrefix('/api');
  await app.listen(PORT);
}
bootstrap();
