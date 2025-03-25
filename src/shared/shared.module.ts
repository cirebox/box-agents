// src/shared/shared.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './providers/prisma.service';
import { AgentPrismaRepository } from './repositories/prisma-orm/agent.repository';
import { PromptEngineeringHelper } from './helpers/prompt-engineering.helper';
import { RabbitMQModule } from './providers/rabbitmq/rabbitmq.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.register(['agents', 'crews', 'tasks']),
  ],
  providers: [
    PrismaService,
    {
      provide: 'IAgentRepository',
      useClass: AgentPrismaRepository,
    },
    PromptEngineeringHelper,
  ],
  exports: [
    PrismaService,
    {
      provide: 'IAgentRepository',
      useClass: AgentPrismaRepository,
    },
    PromptEngineeringHelper,
  ],
})
export class SharedModule {}
