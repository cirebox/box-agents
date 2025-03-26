// src/modules/tasks/services/find-task.service.ts
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ITaskRepository } from 'src/shared/repositories/interfaces/itask.repository';

@Injectable()
export class FindTaskService {
  private readonly logger = new Logger(FindTaskService.name);

  constructor(
    @Inject('ITaskRepository')
    private taskRepository: ITaskRepository,
  ) {}

  async findById(id: string): Promise<Task.Config> {
    this.logger.log(`Finding task with ID: ${id}`);

    try {
      const task = await this.taskRepository.findById(id);

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      return task;
    } catch (error) {
      this.logger.error(`Failed to find task: ${error.message}`);
      throw error;
    }
  }

  async findAll(filters?: Record<string, any>): Promise<Task.Config[]> {
    this.logger.log(
      `Finding tasks with filters: ${JSON.stringify(filters || {})}`,
    );

    try {
      const tasks = await this.taskRepository.findAll(filters);
      this.logger.log(`Found ${tasks.length} tasks`);
      return tasks;
    } catch (error) {
      this.logger.error(`Failed to find tasks: ${error.message}`);
      throw error;
    }
  }

  async findByAgent(agentId: string): Promise<Task.Config[]> {
    this.logger.log(`Finding tasks assigned to agent: ${agentId}`);

    try {
      const tasks = await this.taskRepository.findAll({
        assignedAgentId: agentId,
      });
      this.logger.log(
        `Found ${tasks.length} tasks assigned to agent ${agentId}`,
      );
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to find tasks for agent ${agentId}: ${error.message}`,
      );
      throw error;
    }
  }

  async findByCrew(crewId: string): Promise<Task.Config[]> {
    this.logger.log(`Finding tasks assigned to crew: ${crewId}`);

    try {
      const tasks = await this.taskRepository.findAll({
        assignedCrewId: crewId,
      });
      this.logger.log(`Found ${tasks.length} tasks assigned to crew ${crewId}`);
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to find tasks for crew ${crewId}: ${error.message}`,
      );
      throw error;
    }
  }

  async findByPriority(priority: string): Promise<Task.Config[]> {
    this.logger.log(`Finding tasks with priority: ${priority}`);

    try {
      const tasks = await this.taskRepository.findAll({ priority });
      this.logger.log(`Found ${tasks.length} tasks with priority ${priority}`);
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to find tasks with priority ${priority}: ${error.message}`,
      );
      throw error;
    }
  }

  async findByTags(tags: string[]): Promise<Task.Config[]> {
    this.logger.log(`Finding tasks with tags: ${tags.join(', ')}`);

    try {
      const tasks = await this.taskRepository.findAll({ tags });
      this.logger.log(`Found ${tasks.length} tasks with requested tags`);
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to find tasks with tags ${tags.join(', ')}: ${error.message}`,
      );
      throw error;
    }
  }

  async findUnassigned(): Promise<Task.Config[]> {
    this.logger.log('Finding unassigned tasks');

    try {
      const tasks = await this.taskRepository.findAll({
        assignedAgentId: null,
        assignedCrewId: null,
      });
      this.logger.log(`Found ${tasks.length} unassigned tasks`);
      return tasks;
    } catch (error) {
      this.logger.error(`Failed to find unassigned tasks: ${error.message}`);
      throw error;
    }
  }

  async findByTemplate(templateId: string): Promise<Task.Config[]> {
    this.logger.log(`Finding tasks using template: ${templateId}`);

    try {
      const tasks = await this.taskRepository.findAll({ templateId });
      this.logger.log(
        `Found ${tasks.length} tasks using template ${templateId}`,
      );
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to find tasks using template ${templateId}: ${error.message}`,
      );
      throw error;
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Task.Config[]> {
    this.logger.log(`Finding tasks between ${startDate} and ${endDate}`);

    try {
      const tasks = await this.taskRepository.findAll({
        createdAfter: startDate,
        createdBefore: endDate,
      });
      this.logger.log(
        `Found ${tasks.length} tasks in the specified date range`,
      );
      return tasks;
    } catch (error) {
      this.logger.error(`Failed to find tasks in date range: ${error.message}`);
      throw error;
    }
  }

  async findWithDeadlineBefore(date: Date): Promise<Task.Config[]> {
    this.logger.log(`Finding tasks with deadline before: ${date}`);

    try {
      const tasks = await this.taskRepository.findAll({
        deadlineBefore: date,
      });
      this.logger.log(
        `Found ${tasks.length} tasks with deadline before ${date}`,
      );
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to find tasks with deadline before ${date}: ${error.message}`,
      );
      throw error;
    }
  }

  async findExecutionById(executionId: string): Promise<Task.Execution> {
    this.logger.log(`Finding execution with ID: ${executionId}`);

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
      this.logger.error(`Failed to find execution: ${error.message}`);
      throw error;
    }
  }

  async findExecutionsByTask(taskId: string): Promise<Task.Execution[]> {
    this.logger.log(`Finding executions for task: ${taskId}`);

    try {
      const executions = await this.taskRepository.findExecutions(taskId);
      this.logger.log(
        `Found ${executions.length} executions for task ${taskId}`,
      );
      return executions;
    } catch (error) {
      this.logger.error(
        `Failed to find executions for task ${taskId}: ${error.message}`,
      );
      throw error;
    }
  }

  async findExecutionsByAgent(agentId: string): Promise<Task.Execution[]> {
    this.logger.log(`Finding executions by agent: ${agentId}`);

    try {
      const executions = await this.taskRepository.findAllExecutions({
        agentId,
      });
      this.logger.log(
        `Found ${executions.length} executions by agent ${agentId}`,
      );
      return executions;
    } catch (error) {
      this.logger.error(
        `Failed to find executions by agent ${agentId}: ${error.message}`,
      );
      throw error;
    }
  }

  async findExecutionsByCrew(crewId: string): Promise<Task.Execution[]> {
    this.logger.log(`Finding executions by crew: ${crewId}`);

    try {
      const executions = await this.taskRepository.findAllExecutions({
        crewId,
      });
      this.logger.log(
        `Found ${executions.length} executions by crew ${crewId}`,
      );
      return executions;
    } catch (error) {
      this.logger.error(
        `Failed to find executions by crew ${crewId}: ${error.message}`,
      );
      throw error;
    }
  }

  async findExecutionsByStatus(
    status: Task.ExecutionStatus,
  ): Promise<Task.Execution[]> {
    this.logger.log(`Finding executions with status: ${status}`);

    try {
      const executions = await this.taskRepository.findAllExecutions({
        status,
      });
      this.logger.log(
        `Found ${executions.length} executions with status ${status}`,
      );
      return executions;
    } catch (error) {
      this.logger.error(
        `Failed to find executions with status ${status}: ${error.message}`,
      );
      throw error;
    }
  }
}
