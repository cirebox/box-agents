// src/shared/providers/rabbitmq/rabbitmq.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQHelper } from './rabbitmq.helper';

@Module({})
export class RabbitMQModule {
  static register(): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        ConfigModule,
        ClientsModule.registerAsync([
          {
            name: 'RABBITMQ_CLIENT',
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
              const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
              if (!rabbitmqUrl) {
                throw new Error(
                  'RABBITMQ_URL environment variable is not defined',
                );
              }

              return {
                transport: Transport.RMQ,
                options: {
                  urls: [rabbitmqUrl],
                  queue: 'ai_agents_queue',
                  queueOptions: {
                    durable: true,
                  },
                  prefetchCount: 1,
                },
              };
            },
            inject: [ConfigService],
          },
        ]),
      ],
      providers: [RabbitMQService, RabbitMQHelper],
      exports: [RabbitMQService, RabbitMQHelper, ClientsModule],
    };
  }
}
