// src/modules/tasks/services/track-task.service.ts
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ITaskRepository } from 'src/shared/repositories/interfaces/itask.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TrackTaskService {
  private readonly logger = new Logger(TrackTaskService.name);

  constructor(
    @Inject('ITaskRepository')
    private taskRepository: ITaskRepository,
    private eventEmitter: EventEmitter2,
  ) {
    // Inscrever-se nos eventos de execução para rastreamento automático
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Registrar listeners para eventos de execução
    this.eventEmitter.on('task.execution.started', (data) => {
      this.logger.debug(
        `Event received: task.execution.started for execution ${data.executionId}`,
      );
    });

    this.eventEmitter.on('task.execution.completed', (data) => {
      this.logger.debug(
        `Event received: task.execution.completed for execution ${data.executionId}`,
      );
    });

    this.eventEmitter.on('task.execution.failed', (data) => {
      this.logger.debug(
        `Event received: task.execution.failed for execution ${data.executionId}`,
      );
    });

    this.eventEmitter.on('task.execution.cancelled', (data) => {
      this.logger.debug(
        `Event received: task.execution.cancelled for execution ${data.executionId}`,
      );
    });
  }

  async getExecution(executionId: string): Promise<Task.Execution> {
    this.logger.log(`Getting execution with ID: ${executionId}`);

    try {
      const execution =
        await this.taskRepository.findExecutionById(executionId);

      if (!execution) {
        throw new NotFoundException(
          `Execution with ID ${executionId} not found`,
        );
      }

      return execution;
    } catch (error) {
      this.logger.error(`Error getting execution: ${error.message}`);
      throw error;
    }
  }

  async getTaskExecutions(taskId: string): Promise<Task.Execution[]> {
    this.logger.log(`Getting executions for task: ${taskId}`);

    try {
      const executions = await this.taskRepository.findExecutions(taskId);
      this.logger.log(
        `Found ${executions.length} executions for task ${taskId}`,
      );
      return executions;
    } catch (error) {
      this.logger.error(`Error getting task executions: ${error.message}`);
      throw error;
    }
  }

  async trackExecutionStart(executionId: string): Promise<void> {
    this.logger.log(`Tracking start of execution: ${executionId}`);

    try {
      const execution =
        await this.taskRepository.findExecutionById(executionId);

      if (!execution) {
        this.logger.warn(
          `Execution ${executionId} not found for tracking start`,
        );
        return;
      }

      // Atualizar apenas se o status for apropriado
      if (execution.status === 'pending') {
        execution.status = 'in-progress';
        execution.logs.push({
          timestamp: new Date(),
          level: 'info',
          message: 'Execution started tracking',
        });

        await this.taskRepository.saveExecution(execution);
        this.logger.log(
          `Updated execution ${executionId} status to in-progress`,
        );
      }
    } catch (error) {
      this.logger.error(`Error tracking execution start: ${error.message}`);
      throw error;
    }
  }

  async trackExecutionCompletion(
    executionId: string,
    output: string,
    success: boolean,
    metrics?: Task.ExecutionMetrics,
  ): Promise<void> {
    this.logger.log(`Tracking completion of execution: ${executionId}`);

    try {
      const execution =
        await this.taskRepository.findExecutionById(executionId);

      if (!execution) {
        this.logger.warn(
          `Execution ${executionId} not found for tracking completion`,
        );
        return;
      }

      // Atualizar apenas se estiver em progresso
      if (execution.status === 'in-progress') {
        execution.status = 'completed';
        execution.output = output;
        execution.finishedAt = new Date();
        execution.executionTime =
          execution.finishedAt.getTime() - execution.startedAt.getTime();

        if (metrics) {
          execution.metrics = metrics;
        }

        execution.logs.push({
          timestamp: new Date(),
          level: 'info',
          message: 'Execution completed',
          metadata: {
            success,
            executionTime: execution.executionTime,
          },
        });

        await this.taskRepository.saveExecution(execution);
        this.logger.log(`Updated execution ${executionId} status to completed`);
      }
    } catch (error) {
      this.logger.error(
        `Error tracking execution completion: ${error.message}`,
      );
      throw error;
    }
  }

  async trackExecutionFailure(
    executionId: string,
    error: string,
    metrics?: Task.ExecutionMetrics,
  ): Promise<void> {
    this.logger.log(`Tracking failure of execution: ${executionId}`);

    try {
      const execution =
        await this.taskRepository.findExecutionById(executionId);

      if (!execution) {
        this.logger.warn(
          `Execution ${executionId} not found for tracking failure`,
        );
        return;
      }

      // Atualizar apenas se estiver em um estado apropriado
      if (
        execution.status === 'in-progress' ||
        execution.status === 'pending'
      ) {
        execution.status = 'failed';
        execution.error = error;
        execution.finishedAt = new Date();
        execution.executionTime =
          execution.finishedAt.getTime() - execution.startedAt.getTime();

        if (metrics) {
          execution.metrics = metrics;
        }

        execution.logs.push({
          timestamp: new Date(),
          level: 'error',
          message: 'Execution failed',
          metadata: {
            error,
            executionTime: execution.executionTime,
          },
        });

        await this.taskRepository.saveExecution(execution);
        this.logger.log(`Updated execution ${executionId} status to failed`);
      }
    } catch (error) {
      this.logger.error(`Error tracking execution failure: ${error.message}`);
      throw error;
    }
  }

  async addExecutionLog(
    executionId: string,
    level: 'info' | 'warning' | 'error' | 'debug',
    message: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Adding log to execution ${executionId}: ${message}`);

    try {
      const execution =
        await this.taskRepository.findExecutionById(executionId);

      if (!execution) {
        this.logger.warn(`Execution ${executionId} not found for adding log`);
        return;
      }

      // Adicionar o log
      execution.logs.push({
        timestamp: new Date(),
        level,
        message,
        metadata,
      });

      await this.taskRepository.saveExecution(execution);
      this.logger.log(`Added log to execution ${executionId}`);
    } catch (error) {
      this.logger.error(`Error adding log to execution: ${error.message}`);
      throw error;
    }
  }

  async generateExecutionReport(
    executionId: string,
  ): Promise<Record<string, any>> {
    this.logger.log(`Generating report for execution: ${executionId}`);

    try {
      const execution =
        await this.taskRepository.findExecutionById(executionId);

      if (!execution) {
        throw new NotFoundException(
          `Execution with ID ${executionId} not found`,
        );
      }

      // Buscar a tarefa associada para incluir no relatório
      const task = await this.taskRepository.findById(execution.taskId);

      if (!task) {
        throw new NotFoundException(
          `Task with ID ${execution.taskId} not found`,
        );
      }

      // Construir o relatório
      const report = {
        executionId: execution.id,
        taskId: execution.taskId,
        taskDescription: task.description,
        agentId: execution.agentId,
        crewId: execution.crewId,
        status: execution.status,
        startedAt: execution.startedAt,
        finishedAt: execution.finishedAt,
        executionTime: execution.executionTime,
        attempts: execution.attempts,
        metrics: execution.metrics,
        error: execution.error,
        logSummary: this.summarizeLogs(execution.logs),
        outputPreview: execution.output
          ? this.getOutputPreview(execution.output)
          : null,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`Generated report for execution ${executionId}`);
      return report;
    } catch (error) {
      this.logger.error(`Error generating execution report: ${error.message}`);
      throw error;
    }
  }

  async generateTaskExecutionSummary(
    taskId: string,
  ): Promise<Record<string, any>> {
    this.logger.log(`Generating execution summary for task: ${taskId}`);

    try {
      const executions = await this.taskRepository.findExecutions(taskId);

      if (executions.length === 0) {
        this.logger.warn(`No executions found for task ${taskId}`);
        return {
          taskId,
          totalExecutions: 0,
          message: 'No executions found for this task',
        };
      }

      // Buscar a tarefa
      const task = await this.taskRepository.findById(taskId);

      if (!task) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }

      // Calcular estatísticas
      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter(
        (e) => e.status === 'completed',
      ).length;
      const failedExecutions = executions.filter(
        (e) => e.status === 'failed',
      ).length;
      const cancelledExecutions = executions.filter(
        (e) => e.status === 'cancelled',
      ).length;
      const inProgressExecutions = executions.filter(
        (e) => e.status === 'in-progress',
      ).length;

      const successRate =
        totalExecutions > 0
          ? (successfulExecutions / totalExecutions) * 100
          : 0;

      // Calcular tempo médio de execução para execuções bem-sucedidas
      let avgExecutionTime = 0;
      const completedExecutions = executions.filter(
        (e) => e.status === 'completed' && e.executionTime,
      );

      if (completedExecutions.length > 0) {
        const totalTime = completedExecutions.reduce(
          (sum, e) => sum + (e.executionTime || 0),
          0,
        );
        avgExecutionTime = totalTime / completedExecutions.length;
      }

      // Listar execuções mais recentes
      const recentExecutions = executions
        .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
        .slice(0, 5)
        .map((e) => ({
          id: e.id,
          status: e.status,
          startedAt: e.startedAt,
          finishedAt: e.finishedAt,
          executionTime: e.executionTime,
        }));

      // Construir o relatório
      const summary = {
        taskId,
        taskDescription: task.description,
        totalExecutions,
        statistics: {
          successful: successfulExecutions,
          failed: failedExecutions,
          cancelled: cancelledExecutions,
          inProgress: inProgressExecutions,
          successRate: `${successRate.toFixed(2)}%`,
          avgExecutionTime:
            avgExecutionTime > 0
              ? `${(avgExecutionTime / 1000).toFixed(2)}s`
              : 'N/A',
        },
        recentExecutions,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`Generated execution summary for task ${taskId}`);
      return summary;
    } catch (error) {
      this.logger.error(
        `Error generating task execution summary: ${error.message}`,
      );
      throw error;
    }
  }

  // Métodos auxiliares

  private summarizeLogs(logs: Task.ExecutionLog[]): Record<string, number> {
    // Conta a quantidade de cada tipo de log
    const summary: Record<string, number> = {
      info: 0,
      warning: 0,
      error: 0,
      debug: 0,
    };

    logs.forEach((log) => {
      summary[log.level]++;
    });

    return summary;
  }

  private getOutputPreview(output: string, maxLength: number = 200): string {
    if (!output) return '';

    if (output.length <= maxLength) {
      return output;
    }

    return output.substring(0, maxLength) + '...';
  }
}
