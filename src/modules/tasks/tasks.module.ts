// src/modules/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { TasksMqController } from './controllers/mq.controller';

// Services
import { TaskManagerService } from './services/task-manager.service';
import { TaskExecutorService } from './services/task-executor.service';

// Serviços de casos de uso específicos
import { CreateTaskService } from './services/create-task.service';
import { UpdateTaskService } from './services/update-task.service';
import { DeleteTaskService } from './services/delete-task.service';
import { FindTaskService } from './services/find-task.service';
import { ExecuteTaskService } from './services/execute-task.service';
import { TrackTaskService } from './services/track-task.service';

// Importação dos módulos necessários
import { SharedModule } from 'src/shared/shared.module';
import { AgentsModule } from '../agents/agents.module';
import { TasksController } from './controllers/http.controller';
import { AIProviderFactory } from 'src/shared/providers/ai-provider.factory';

@Module({
  imports: [
    ConfigModule,
    SharedModule,
    AgentsModule, // Importamos o módulo de agentes pois precisaremos interagir com eles
  ],
  controllers: [TasksController, TasksMqController],
  providers: [
    // Serviços principais
    TaskManagerService,
    AIProviderFactory,
    TaskExecutorService,

    // Serviços específicos para casos de uso
    CreateTaskService,
    UpdateTaskService,
    DeleteTaskService,
    FindTaskService,
    ExecuteTaskService,
    TrackTaskService,
  ],
  exports: [
    TaskManagerService,
    TaskExecutorService,
    CreateTaskService,
    FindTaskService,
    ExecuteTaskService,
  ],
})
export class TasksModule {}
