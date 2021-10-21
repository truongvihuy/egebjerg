import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyCookie from 'fastify-cookie';
import * as Sentry from '@sentry/node';
import getConfig from './config/config';
const config = getConfig();
const cookieParser = require('cookie-parser')
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  if (config.sentry.enable) {
    Sentry.init({
      dsn: config.sentry.dns
    });
  }
  app.setGlobalPrefix('api');

  app.use(cookieParser());
  app.register(fastifyCookie, {
    secret: 'egebjerg-Cookie-secret', // for cookies signature
  });
  await app.listen(5001);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();