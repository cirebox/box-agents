// src/shared/shared.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './providers/prisma.service';
import { AgentPrismaRepository } from './repositories/prisma-orm/agent.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService,
    {
      provide: 'IAgentRepository',
      useClass: AgentPrismaRepository,
    },
  ],
  exports: [PrismaService, {
    provide: 'IAgentRepository',
    useClass: AgentPrismaRepository,
  },],
})
export class SharedModule { }
