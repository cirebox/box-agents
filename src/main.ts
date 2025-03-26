import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SWAGGER_CONFIG } from './swagger/swagger.config';
import { createSwaggerDocumentation } from './swagger/swagger.create-document';
import * as express from 'express';
import { join } from 'path';
import * as basicAuth from 'express-basic-auth';

import { config } from 'dotenv-safe';
import { Transport } from '@nestjs/microservices';
config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    // {
    //   logger: LoggerFactory(),
    // },
  );

  // Configuração do microserviço RabbitMQ
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'ai_agents_queue',
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
    },
  });

  // Configura a pasta pública para servir arquivos estáticos
  app.use('/assets', express.static(join(__dirname, '..', 'public/assets')));

  app.disable('x-powered-by');

  app.use(express.json({ limit: '200mb' }));
  app.enableCors();
  app.use(compression());

  const users = process.env.DOCS_USER;
  if (users) {
    app.use(
      '/docs*',
      basicAuth({
        challenge: true,
        users: JSON.parse(users),
      }),
    );
  } else {
    console.warn(
      'DOCS_USER environment variable not set, API documentation will be public.',
    );
  }

  const start = process.env.NODE_ENV;
  if (start === 'development') {
    createSwaggerDocumentation('docs', app, SWAGGER_CONFIG);
  }

  app.startAllMicroservices();
  //useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.HTTP_PORT ?? 3000);

  const url = await app.getUrl();
  console.log(`🚀 Application is running on: ${url} =>`, start);
}
bootstrap();
