// src/modules/tasks/services/update-task.service.ts
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ITaskRepository } from 'src/shared/repositories/interfaces/itask.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UpdateTaskService {
  private readonly logger = new Logger(UpdateTaskService.name);

  constructor(
    @Inject('ITaskRepository')
    private taskRepository: ITaskRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, updates: Partial<Task.Config>): Promise<void> {
    this.logger.log(`Updating task with ID: ${id}`);

    try {
      // Verificar se a tarefa existe
      const existingTask = await this.taskRepository.findById(id);

      if (!existingTask) {
        this.logger.warn(`Task with ID ${id} not found`);
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Atualizar a tarefa
      await this.taskRepository.update(id, updates);

      // Emitir evento de atualização
      this.eventEmitter.emit('task.updated', {
        taskId: id,
        updates,
        previousState: existingTask,
      });

      // Se o agente ou crew designado foi alterado, emitir evento específico
      if (
        updates.assignedAgentId &&
        updates.assignedAgentId !== existingTask.assignedAgentId
      ) {
        this.eventEmitter.emit('task.assigned', {
          taskId: id,
          agentId: updates.assignedAgentId,
          previousAgentId: existingTask.assignedAgentId,
        });
      }

      if (
        updates.assignedCrewId &&
        updates.assignedCrewId !== existingTask.assignedCrewId
      ) {
        this.eventEmitter.emit('task.assigned_to_crew', {
          taskId: id,
          crewId: updates.assignedCrewId,
          previousCrewId: existingTask.assignedCrewId,
        });
      }

      this.logger.log(`Task ${id} updated successfully`);
    } catch (error) {
      this.logger.error(`Failed to update task ${id}: ${error.message}`);
      throw error;
    }
  }

  async updatePriority(
    id: string,
    priority: 'low' | 'medium' | 'high' | 'critical',
  ): Promise<void> {
    this.logger.log(`Updating priority of task ${id} to ${priority}`);

    try {
      await this.execute(id, { priority });
      this.logger.log(`Priority of task ${id} updated to ${priority}`);
    } catch (error) {
      this.logger.error(
        `Failed to update priority of task ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async assignToAgent(id: string, agentId: string): Promise<void> {
    this.logger.log(`Assigning task ${id} to agent ${agentId}`);

    try {
      await this.execute(id, { assignedAgentId: agentId });
      this.logger.log(`Task ${id} assigned to agent ${agentId}`);
    } catch (error) {
      this.logger.error(
        `Failed to assign task ${id} to agent ${agentId}: ${error.message}`,
      );
      throw error;
    }
  }

  async assignToCrew(id: string, crewId: string): Promise<void> {
    this.logger.log(`Assigning task ${id} to crew ${crewId}`);

    try {
      await this.execute(id, { assignedCrewId: crewId });
      this.logger.log(`Task ${id} assigned to crew ${crewId}`);
    } catch (error) {
      this.logger.error(
        `Failed to assign task ${id} to crew ${crewId}: ${error.message}`,
      );
      throw error;
    }
  }
}
