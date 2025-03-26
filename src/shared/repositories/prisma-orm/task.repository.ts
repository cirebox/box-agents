// src/shared/repositories/prisma-orm/task.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { ITaskRepository } from '../interfaces/itask.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class TaskPrismaRepository implements ITaskRepository {
  private readonly logger = new Logger(TaskPrismaRepository.name);

  constructor(private prisma: PrismaService) {}

  async create(data: Task.Config): Promise<Task.Config> {
    try {
      // Adaptar os dados para o formato esperado pelo Prisma
      const prismaData = {
        id: data.id || `task-${randomUUID()}`,
        description: data.description,
        expectedOutput: data.expectedOutput,
        context: data.context ? JSON.stringify(data.context) : null,
        priority: data.priority || 'medium',
        deadline: data.deadline,
        assignedAgentId: data.assignedAgentId,
        assignedCrewId: data.assignedCrewId,
        dependencies: data.dependencies
          ? JSON.stringify(data.dependencies)
          : null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        templateId: data.templateId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const task = await this.prisma.task.create({
        data: prismaData,
      });

      return this.mapToTaskConfig(task);
    } catch (error) {
      this.logger.error(`Error creating task: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, data: Partial<Task.Config>): Promise<Task.Config> {
    try {
      // Remover campos nulos ou indefinidos
      const updateData: Record<string, any> = {};

      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.expectedOutput !== undefined)
        updateData.expectedOutput = data.expectedOutput;
      if (data.context !== undefined)
        updateData.context = JSON.stringify(data.context);
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.deadline !== undefined) updateData.deadline = data.deadline;
      if (data.assignedAgentId !== undefined)
        updateData.assignedAgentId = data.assignedAgentId;
      if (data.assignedCrewId !== undefined)
        updateData.assignedCrewId = data.assignedCrewId;
      if (data.dependencies !== undefined)
        updateData.dependencies = JSON.stringify(data.dependencies);
      if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
      if (data.templateId !== undefined)
        updateData.templateId = data.templateId;

      // Adicionar timestamp de atualização
      updateData.updatedAt = new Date();

      const task = await this.prisma.task.update({
        where: { id },
        data: updateData,
      });

      return this.mapToTaskConfig(task);
    } catch (error) {
      this.logger.error(`Error updating task: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error deleting task: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<Task.Config | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        return null;
      }

      return this.mapToTaskConfig(task);
    } catch (error) {
      this.logger.error(`Error finding task by ID: ${error.message}`);
      throw error;
    }
  }

  async findAll(filters?: Record<string, any>): Promise<Task.Config[]> {
    try {
      // Construir o filtro para o Prisma
      const where: Record<string, any> = {};

      if (filters) {
        // Adicionar condições baseadas nos filtros fornecidos
        if (filters.priority) where.priority = filters.priority;
        if (filters.assignedAgentId)
          where.assignedAgentId = filters.assignedAgentId;
        if (filters.assignedCrewId)
          where.assignedCrewId = filters.assignedCrewId;
        if (filters.templateId) where.templateId = filters.templateId;

        // Busca por texto na descrição
        if (filters.search) {
          where.description = {
            contains: filters.search,
            mode: 'insensitive',
          };
        }

        // Filtragem por tags (caso especial)
        if (filters.tags && Array.isArray(filters.tags)) {
          // Criamos uma condição que verifica se o array de tags serializado contém todas as tags fornecidas
          // Isso é uma simplificação e pode não ser eficiente para grandes conjuntos de dados
          const tagConditions = filters.tags.map((tag) => ({
            tags: { contains: tag },
          }));
          where.OR = tagConditions;
        }

        // Filtragem por data de criação
        if (filters.createdAfter) {
          where.createdAt = { gte: new Date(filters.createdAfter) };
        }

        if (filters.createdBefore) {
          where.createdAt = {
            ...(where.createdAt || {}),
            lte: new Date(filters.createdBefore),
          };
        }

        // Filtragem por deadline
        if (filters.deadlineAfter) {
          where.deadline = { gte: new Date(filters.deadlineAfter) };
        }

        if (filters.deadlineBefore) {
          where.deadline = {
            ...(where.deadline || {}),
            lte: new Date(filters.deadlineBefore),
          };
        }
      }

      const tasks = await this.prisma.task.findMany({
        where,
        orderBy: filters?.sortBy
          ? { [filters.sortBy]: filters.sortDirection || 'desc' }
          : { createdAt: 'desc' },
      });

      return tasks.map((task) => this.mapToTaskConfig(task));
    } catch (error) {
      this.logger.error(`Error finding tasks: ${error.message}`);
      throw error;
    }
  }

  async saveExecution(execution: Task.Execution): Promise<Task.Execution> {
    try {
      // Mapear para o formato do Prisma
      const prismaData = {
        id: execution.id,
        taskId: execution.taskId,
        agentId: execution.agentId,
        crewId: execution.crewId,
        input: JSON.stringify(execution.input),
        output: execution.output,
        status: execution.status,
        executionTime: execution.executionTime,
        error: execution.error,
        attempts: execution.attempts,
        logs: JSON.stringify(execution.logs),
        startedAt: execution.startedAt,
        finishedAt: execution.finishedAt,
        metrics: execution.metrics ? JSON.stringify(execution.metrics) : null,
      };

      // Verificar se a execução já existe
      const existingExecution = await this.prisma.taskExecution.findUnique({
        where: { id: execution.id },
      });

      if (existingExecution) {
        // Atualizar
        const updatedExecution = await this.prisma.taskExecution.update({
          where: { id: execution.id },
          data: prismaData,
        });
        return this.mapToTaskExecution(updatedExecution);
      } else {
        // Criar novo
        const newExecution = await this.prisma.taskExecution.create({
          data: prismaData,
        });
        return this.mapToTaskExecution(newExecution);
      }
    } catch (error) {
      this.logger.error(`Error saving execution: ${error.message}`);
      throw error;
    }
  }

  async findExecutionById(id: string): Promise<Task.Execution | null> {
    try {
      const execution = await this.prisma.taskExecution.findUnique({
        where: { id },
      });

      if (!execution) {
        return null;
      }

      return this.mapToTaskExecution(execution);
    } catch (error) {
      this.logger.error(`Error finding execution by ID: ${error.message}`);
      throw error;
    }
  }

  async findExecutions(taskId: string): Promise<Task.Execution[]> {
    try {
      const executions = await this.prisma.taskExecution.findMany({
        where: { taskId },
        orderBy: { startedAt: 'desc' },
      });

      return executions.map((execution) => this.mapToTaskExecution(execution));
    } catch (error) {
      this.logger.error(`Error finding executions: ${error.message}`);
      throw error;
    }
  }

  async findAllExecutions(
    filters?: Record<string, any>,
  ): Promise<Task.Execution[]> {
    try {
      const where: Record<string, any> = {};

      if (filters) {
        if (filters.taskId) where.taskId = filters.taskId;
        if (filters.agentId) where.agentId = filters.agentId;
        if (filters.crewId) where.crewId = filters.crewId;
        if (filters.status) where.status = filters.status;

        if (filters.startedAfter) {
          where.startedAt = { gte: new Date(filters.startedAfter) };
        }

        if (filters.startedBefore) {
          where.startedAt = {
            ...(where.startedAt || {}),
            lte: new Date(filters.startedBefore),
          };
        }

        if (filters.success !== undefined) {
          where.success = filters.success;
        }
      }

      const executions = await this.prisma.taskExecution.findMany({
        where,
        orderBy: filters?.sortBy
          ? { [filters.sortBy]: filters.sortDirection || 'desc' }
          : { startedAt: 'desc' },
      });

      return executions.map((execution) => this.mapToTaskExecution(execution));
    } catch (error) {
      this.logger.error(`Error finding all executions: ${error.message}`);
      throw error;
    }
  }

  async saveTemplate(template: Task.Template): Promise<Task.Template> {
    try {
      // Mapear para o formato do Prisma
      const prismaData = {
        id: template.id,
        name: template.name,
        description: template.description,
        promptTemplate: template.promptTemplate,
        defaultModelName: template.defaultModelName,
        parameters: JSON.stringify(template.parameters),
        category: template.category,
        tags: template.tags ? JSON.stringify(template.tags) : null,
        createdAt: template.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // Verificar se o template já existe
      const existingTemplate = await this.prisma.taskTemplate.findUnique({
        where: { id: template.id },
      });

      if (existingTemplate) {
        // Atualizar
        const updatedTemplate = await this.prisma.taskTemplate.update({
          where: { id: template.id },
          data: prismaData,
        });
        return this.mapToTaskTemplate(updatedTemplate);
      } else {
        // Criar novo
        const newTemplate = await this.prisma.taskTemplate.create({
          data: prismaData,
        });
        return this.mapToTaskTemplate(newTemplate);
      }
    } catch (error) {
      this.logger.error(`Error saving template: ${error.message}`);
      throw error;
    }
  }

  async findTemplateById(id: string): Promise<Task.Template | null> {
    try {
      const template = await this.prisma.taskTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        return null;
      }

      return this.mapToTaskTemplate(template);
    } catch (error) {
      this.logger.error(`Error finding template by ID: ${error.message}`);
      throw error;
    }
  }

  async findAllTemplates(
    filters?: Record<string, any>,
  ): Promise<Task.Template[]> {
    try {
      const where: Record<string, any> = {};

      if (filters) {
        if (filters.category) where.category = filters.category;

        if (filters.search) {
          where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ];
        }

        // Filtragem por tags (simplificada)
        if (filters.tags && Array.isArray(filters.tags)) {
          const tagConditions = filters.tags.map((tag) => ({
            tags: { contains: tag },
          }));
          where.OR = [...(where.OR || []), ...tagConditions];
        }
      }

      const templates = await this.prisma.taskTemplate.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      return templates.map((template) => this.mapToTaskTemplate(template));
    } catch (error) {
      this.logger.error(`Error finding all templates: ${error.message}`);
      throw error;
    }
  }

  // Métodos auxiliares de mapeamento

  private mapToTaskConfig(prismaTask: any): Task.Config {
    return {
      id: prismaTask.id,
      description: prismaTask.description,
      expectedOutput: prismaTask.expectedOutput,
      context: prismaTask.context ? JSON.parse(prismaTask.context) : undefined,
      priority: prismaTask.priority,
      deadline: prismaTask.deadline,
      assignedAgentId: prismaTask.assignedAgentId,
      assignedCrewId: prismaTask.assignedCrewId,
      dependencies: prismaTask.dependencies
        ? JSON.parse(prismaTask.dependencies)
        : undefined,
      tags: prismaTask.tags ? JSON.parse(prismaTask.tags) : undefined,
      templateId: prismaTask.templateId,
    };
  }

  private mapToTaskExecution(prismaExecution: any): Task.Execution {
    return {
      id: prismaExecution.id,
      taskId: prismaExecution.taskId,
      agentId: prismaExecution.agentId,
      crewId: prismaExecution.crewId,
      input: prismaExecution.input ? JSON.parse(prismaExecution.input) : {},
      output: prismaExecution.output,
      status: prismaExecution.status as Task.ExecutionStatus,
      startedAt: prismaExecution.startedAt,
      finishedAt: prismaExecution.finishedAt,
      executionTime: prismaExecution.executionTime,
      error: prismaExecution.error,
      attempts: prismaExecution.attempts,
      logs: prismaExecution.logs ? JSON.parse(prismaExecution.logs) : [],
      metrics: prismaExecution.metrics
        ? JSON.parse(prismaExecution.metrics)
        : undefined,
    };
  }

  private mapToTaskTemplate(prismaTemplate: any): Task.Template {
    return {
      id: prismaTemplate.id,
      name: prismaTemplate.name,
      description: prismaTemplate.description,
      promptTemplate: prismaTemplate.promptTemplate,
      defaultModelName: prismaTemplate.defaultModelName,
      parameters: prismaTemplate.parameters
        ? JSON.parse(prismaTemplate.parameters)
        : [],
      category: prismaTemplate.category,
      tags: prismaTemplate.tags ? JSON.parse(prismaTemplate.tags) : undefined,
      createdAt: prismaTemplate.createdAt,
      updatedAt: prismaTemplate.updatedAt,
    };
  }
}
