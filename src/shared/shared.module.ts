// src/shared/shared.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './providers/prisma.service';
import { AgentPrismaRepository } from './repositories/prisma-orm/agent.repository';
import { PromptEngineeringHelper } from './helpers/prompt-engineering.helper';
import { RabbitMQModule } from './providers/rabbitmq/rabbitmq.module';
import { TaskPrismaRepository } from './repositories/prisma-orm/task.repository';
import { AIProviderModule } from './providers/ai-provider.module';

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
    {
      provide: 'ITaskRepository',
      useClass: TaskPrismaRepository,
    },
    AIProviderModule,
    PromptEngineeringHelper,
  ],
  exports: [
    PrismaService,
    {
      provide: 'IAgentRepository',
      useClass: AgentPrismaRepository,
    },
    {
      provide: 'ITaskRepository',
      useClass: TaskPrismaRepository,
    },
    AIProviderModule,
    PromptEngineeringHelper,
  ],
})
export class SharedModule { }
