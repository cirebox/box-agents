// src/shared/shared.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './providers/prisma.service';
import { AgentPrismaRepository } from './repositories/prisma-orm/agent.repository';
import { TaskPrismaRepository } from './repositories/prisma-orm/task.repository';
import { PromptEngineeringHelper } from './helpers/prompt-engineering.helper';
import { RabbitMQModule } from './providers/rabbitmq/rabbitmq.module';
import { AIProviderModule } from './providers/ai-provider.module';

const repositories: Array<{
  provide: string;
  useClass: any;
}> = [
  {
    provide: 'IAgentRepository',
    useClass: AgentPrismaRepository,
  },
  {
    provide: 'ITaskRepository',
    useClass: TaskPrismaRepository,
  },
];

@Global()
@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.register(), // Removendo os argumentos
    AIProviderModule,
  ],
  providers: [PrismaService, ...repositories, PromptEngineeringHelper],
  exports: [
    PrismaService,
    ...repositories,
    PromptEngineeringHelper,
    AIProviderModule,
  ],
})
export class SharedModule {}
