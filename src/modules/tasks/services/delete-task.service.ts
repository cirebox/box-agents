// src/modules/tasks/services/delete-task.service.ts
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ITaskRepository } from 'src/shared/repositories/interfaces/itask.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DeleteTaskService {
  private readonly logger = new Logger(DeleteTaskService.name);

  constructor(
    @Inject('ITaskRepository')
    private taskRepository: ITaskRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`Deleting task with ID: ${id}`);

    try {
      // Verificar se a tarefa existe
      const existingTask = await this.taskRepository.findById(id);

      if (!existingTask) {
        this.logger.warn(`Task with ID ${id} not found`);
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Verificar se há execuções em andamento
      const executions = await this.taskRepository.findExecutions(id);
      const activeExecutions = executions.filter(
        (exec) => exec.status === 'in-progress' || exec.status === 'pending',
      );

      if (activeExecutions.length > 0) {
        this.logger.warn(`Cannot delete task ${id} with active executions`);
        throw new Error(
          `Cannot delete task with active executions. Please cancel executions first.`,
        );
      }

      // Remover a tarefa
      await this.taskRepository.delete(id);

      // Emitir evento de exclusão
      this.eventEmitter.emit('task.deleted', {
        taskId: id,
        taskDetails: existingTask,
      });

      this.logger.log(`Task ${id} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete task ${id}: ${error.message}`);
      throw error;
    }
  }

  async batchDelete(
    ids: string[],
  ): Promise<{ success: string[]; failed: { id: string; reason: string }[] }> {
    this.logger.log(`Batch deleting ${ids.length} tasks`);

    const result = {
      success: [] as string[],
      failed: [] as { id: string; reason: string }[],
    };

    for (const id of ids) {
      try {
        await this.execute(id);
        result.success.push(id);
      } catch (error) {
        result.failed.push({
          id,
          reason: error.message,
        });
      }
    }

    this.logger.log(
      `Batch delete completed: ${result.success.length} successful, ${result.failed.length} failed`,
    );
    return result;
  }
}
