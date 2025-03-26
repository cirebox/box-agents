// src/modules/tasks/services/create-task.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITaskRepository } from 'src/shared/repositories/interfaces/itask.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';

export interface CreateTaskParams {
  // Exportando a interface
  description: string;
  expectedOutput?: string;
  context?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
  assignedAgentId?: string;
  assignedCrewId?: string;
  dependencies?: string[];
  tags?: string[];
  templateId?: string;
}

@Injectable()
export class CreateTaskService {
  private readonly logger = new Logger(CreateTaskService.name);

  constructor(
    @Inject('ITaskRepository')
    private taskRepository: ITaskRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(params: CreateTaskParams): Promise<string> {
    this.logger.log(`Creating task with description: ${params.description}`);

    try {
      // Gerar ID único para a tarefa
      const taskId = `task-${randomUUID()}`;

      // Criar configuração da tarefa
      const taskConfig: Task.Config = {
        id: taskId,
        description: params.description,
        expectedOutput: params.expectedOutput,
        context: params.context,
        priority: params.priority || 'medium',
        deadline: params.deadline,
        assignedAgentId: params.assignedAgentId,
        assignedCrewId: params.assignedCrewId,
        dependencies: params.dependencies,
        tags: params.tags,
        templateId: params.templateId,
      };

      // Persistir no repositório
      await this.taskRepository.create(taskConfig);

      // Emitir evento para notificar outros serviços
      this.eventEmitter.emit('task.created', {
        taskId,
        description: params.description,
        assignedAgentId: params.assignedAgentId,
        assignedCrewId: params.assignedCrewId,
      });

      this.logger.log(`Task created successfully with ID: ${taskId}`);
      return taskId;
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`);
      throw error;
    }
  }

  async batchCreate(tasks: CreateTaskParams[]): Promise<string[]> {
    this.logger.log(`Creating batch of ${tasks.length} tasks`);

    try {
      const taskIds: string[] = [];

      // Criar cada tarefa na sequência
      for (const taskParams of tasks) {
        const taskId = await this.execute(taskParams);
        taskIds.push(taskId);
      }

      this.logger.log(
        `Batch creation successful, created ${taskIds.length} tasks`,
      );
      return taskIds;
    } catch (error) {
      this.logger.error(`Failed to create batch of tasks: ${error.message}`);
      throw error;
    }
  }
}
