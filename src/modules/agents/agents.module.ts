// src/modules/agents/agents.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { AgentsController } from './controllers/http.controller';
import { AgentsMqController } from './controllers/mq.controller';

// Services
import { AgentManagerService } from './services/agent-manager.service';
import { AgentFactoryService } from './services/agent-factory.service';
import { AgentExecutorService } from './services/agent-executor.service';
// Serviços específicos de caso de uso
import { CreateAgentService } from './services/create-agent.service';
import { UpdateAgentService } from './services/update-agent.service';
import { DeleteAgentService } from './services/delete-agent.service';
import { FindAgentService } from './services/find-agent.service';
import { CreateCrewService } from './services/create-crew.service';
import { ExecuteTaskService } from './services/execute-task.service';
import { AIProviderModule } from 'src/shared/providers/ai-provider.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [ConfigModule, AIProviderModule, SharedModule],
  controllers: [AgentsController, AgentsMqController],
  providers: [
    // Serviços principais
    AgentManagerService,
    AgentFactoryService,
    AgentExecutorService,

    // Serviços específicos para casos de uso
    CreateAgentService,
    UpdateAgentService,
    DeleteAgentService,
    FindAgentService,
    CreateCrewService,
    ExecuteTaskService,
  ],
  exports: [
    AgentManagerService,
    AgentExecutorService,

    // Exportar serviços de caso de uso para uso por outros módulos
    CreateAgentService,
    FindAgentService,
    ExecuteTaskService,
  ],
})
export class AgentsModule {}
