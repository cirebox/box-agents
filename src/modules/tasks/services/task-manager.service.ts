// src/modules/tasks/services/task-manager.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { ITaskRepository } from '../../../shared/repositories/interfaces/itask.repository';
import { PromptEngineeringHelper } from 'src/shared/helpers/prompt-engineering.helper';
import { randomUUID } from 'crypto';
import { AIProviderFactory } from 'src/shared/providers/ai-provider.factory';
import { ValidateTask } from 'src/core/decorators/validate-task.decorator';

@Injectable()
export class TaskManagerService {
  private readonly logger = new Logger(TaskManagerService.name);
  private tasks: Map<string, Task.Config> = new Map();
  private executions: Map<string, Task.Execution> = new Map();
  private templates: Map<string, Task.Template> = new Map();

  constructor(
    private taskFactory: AIProviderFactory,
    private promptHelper: PromptEngineeringHelper,
    private taskRepository: ITaskRepository,
  ) {}

  @ValidateTask()
  async createTask(taskConfig: Task.Config): Promise<string> {
    this.logger.log(`Creating task: ${taskConfig.description}`);

    // Garantir que temos um ID
    if (!taskConfig.id) {
      taskConfig.id = `task-${randomUUID()}`;
    }

    try {
      // Armazenar na memória (temporário, na implementação real usaria o repositório)
      this.tasks.set(taskConfig.id, taskConfig);

      // Persistir usando o repositório
      await this.taskRepository.create(taskConfig);

      this.logger.log(`Task created with ID: ${taskConfig.id}`);
      return taskConfig.id;
    } catch (error) {
      this.logger.error(`Error creating task: ${error.message}`);
      throw error;
    }
  }

  async getTask(id: string): Promise<Task.Config> {
    this.logger.log(`Getting task with ID: ${id}`);

    try {
      // Tentar buscar no repositório
      const task = await this.taskRepository.findById(id);

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      return task;
    } catch (error) {
      this.logger.error(`Error getting task: ${error.message}`);
      throw error;
    }
  }

  async findTasks(filters: Record<string, any> = {}): Promise<Task.Config[]> {
    this.logger.log(`Finding tasks with filters: ${JSON.stringify(filters)}`);

    try {
      // Buscar no repositório com filtros
      const tasks = await this.taskRepository.findAll(filters);
      return tasks;
    } catch (error) {
      this.logger.error(`Error finding tasks: ${error.message}`);
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<Task.Config>): Promise<void> {
    this.logger.log(`Updating task with ID: ${id}`);

    try {
      // Verificar se a tarefa existe
      const task = await this.taskRepository.findById(id);

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Atualizar no repositório
      await this.taskRepository.update(id, { ...task, ...updates });

      // Atualizar na memória também (para consistência)
      if (this.tasks.has(id)) {
        this.tasks.set(id, { ...task, ...updates });
      }

      this.logger.log(`Task updated successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error updating task: ${error.message}`);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    this.logger.log(`Deleting task with ID: ${id}`);

    try {
      // Verificar se a tarefa existe
      const task = await this.taskRepository.findById(id);

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Remover do repositório
      await this.taskRepository.delete(id);

      // Remover da memória também
      this.tasks.delete(id);

      this.logger.log(`Task deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting task: ${error.message}`);
      throw error;
    }
  }

  async getTaskExecutions(taskId: string): Promise<Task.Execution[]> {
    this.logger.log(`Getting executions for task with ID: ${taskId}`);

    try {
      // Verificar se a tarefa existe
      const task = await this.taskRepository.findById(taskId);

      if (!task) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }

      // Buscar execuções relacionadas a esta tarefa
      const executions = await this.taskRepository.findExecutions(taskId);

      return executions;
    } catch (error) {
      this.logger.error(`Error getting task executions: ${error.message}`);
      throw error;
    }
  }

  async getExecution(executionId: string): Promise<Task.Execution> {
    this.logger.log(`Getting execution with ID: ${executionId}`);

    try {
      // Buscar execução específica
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

  async createTemplate(
    templateData: Omit<Task.Template, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> {
    this.logger.log(`Creating template: ${templateData.name}`);

    try {
      const templateId = `template-${randomUUID()}`;

      const template: Task.Template = {
        ...templateData,
        id: templateId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Armazenar na memória
      this.templates.set(templateId, template);

      // Na implementação real, persistiria também no repositório

      this.logger.log(`Template created with ID: ${templateId}`);
      return templateId;
    } catch (error) {
      this.logger.error(`Error creating template: ${error.message}`);
      throw error;
    }
  }

  async getTemplates(): Promise<Task.Template[]> {
    this.logger.log('Getting all templates');

    try {
      // Na implementação real, buscaria do repositório
      // Por enquanto, retorna da memória
      return Array.from(this.templates.values());
    } catch (error) {
      this.logger.error(`Error getting templates: ${error.message}`);
      throw error;
    }
  }

  async getTemplate(templateId: string): Promise<Task.Template> {
    this.logger.log(`Getting template with ID: ${templateId}`);

    try {
      // Buscar da memória (na implementação real, do repositório)
      const template = this.templates.get(templateId);

      if (!template) {
        throw new NotFoundException(`Template with ID ${templateId} not found`);
      }

      return template;
    } catch (error) {
      this.logger.error(`Error getting template: ${error.message}`);
      throw error;
    }
  }

  async createBatchTasks(
    taskConfigs: Partial<Task.Config>[],
  ): Promise<string[]> {
    this.logger.log(`Creating ${taskConfigs.length} tasks in batch`);

    try {
      const taskIds: string[] = [];

      // Processar cada tarefa
      for (const config of taskConfigs) {
        const taskId = await this.createTask({
          id: `task-${randomUUID()}`,
          description: config.description,
          expectedOutput: config.expectedOutput,
          context: config.context,
          priority: config.priority,
          deadline: config.deadline,
          assignedAgentId: config.assignedAgentId,
          assignedCrewId: config.assignedCrewId,
          dependencies: config.dependencies,
          tags: config.tags,
          templateId: config.templateId,
        } as Task.Config);

        taskIds.push(taskId);
      }

      return taskIds;
    } catch (error) {
      this.logger.error(`Error creating batch tasks: ${error.message}`);
      throw error;
    }
  }

  async analyzeTask(
    description: string,
    context?: Record<string, any>,
  ): Promise<any> {
    this.logger.log(`Analyzing task: ${description}`);

    try {
      // Usar PromptEngineeringHelper para construir um prompt de análise
      const prompt = this.promptHelper.buildChainOfThoughtPrompt({
        question: `Analisar a seguinte tarefa: "${description}"${
          context ? ` com o contexto adicional: ${JSON.stringify(context)}` : ''
        }`,
        steps: [
          '1. Identificar o domínio principal da tarefa',
          '2. Determinar a complexidade estimada (baixa, média, alta)',
          '3. Identificar conhecimentos necessários para completar a tarefa',
          '4. Sugerir divisão em subtarefas se aplicável',
          '5. Estimar tempo aproximado de execução',
          '6. Identificar possíveis dependências e pré-requisitos',
          '7. Sugerir agentes mais adequados para executar esta tarefa',
        ],
      });

      // Na implementação real, enviaríamos este prompt para o modelo de IA
      // através do serviço adequado. Aqui vamos simular uma resposta:

      // Análise simulada (na implementação real viria do modelo de IA)
      const analysis = {
        domain: this.inferDomain(description),
        complexity: this.estimateComplexity(description),
        requiredKnowledge: this.identifyRequiredKnowledge(description, context),
        subtasks: this.suggestSubtasks(description, context),
        estimatedTime: this.estimateExecutionTime(description),
        dependencies: this.identifyDependencies(description, context),
        recommendedAgents: this.recommendAgents(description, context),
      };

      this.logger.log(`Task analysis completed`);
      return analysis;
    } catch (error) {
      this.logger.error(`Error analyzing task: ${error.message}`);
      throw error;
    }
  }

  // Métodos auxiliares para análise de tarefas (simulados)

  private inferDomain(description: string): string {
    // Na implementação real, isso seria feito por um modelo de IA
    if (
      description.toLowerCase().includes('api') ||
      description.toLowerCase().includes('backend') ||
      description.toLowerCase().includes('controller') ||
      description.toLowerCase().includes('database')
    )
      return 'backend-development';

    if (
      description.toLowerCase().includes('ui') ||
      description.toLowerCase().includes('interface') ||
      description.toLowerCase().includes('component') ||
      description.toLowerCase().includes('frontend')
    )
      return 'frontend-development';

    if (
      description.toLowerCase().includes('design') ||
      description.toLowerCase().includes('schema') ||
      description.toLowerCase().includes('model') ||
      description.toLowerCase().includes('entity')
    )
      return 'data-modeling';

    return 'general-development';
  }

  private estimateComplexity(description: string): 'low' | 'medium' | 'high' {
    // Baseado no tamanho da descrição e presença de palavras-chave complexas
    const length = description.length;
    const complexityKeywords = [
      'complex',
      'difficult',
      'advanced',
      'secure',
      'optimize',
      'performance',
    ];

    const keywordCount = complexityKeywords.filter((kw) =>
      description.toLowerCase().includes(kw),
    ).length;

    if (length > 200 || keywordCount >= 2) return 'high';
    if (length > 100 || keywordCount >= 1) return 'medium';
    return 'low';
  }

  private identifyRequiredKnowledge(
    description: string,
    context?: Record<string, any>,
  ): string[] {
    const knowledge = new Set<string>();

    // Tecnologias de backend
    if (
      description.toLowerCase().includes('nestjs') ||
      context?.technologies?.includes('nestjs')
    )
      knowledge.add('NestJS');

    if (
      description.toLowerCase().includes('prisma') ||
      context?.database?.includes('prisma')
    )
      knowledge.add('Prisma ORM');

    // Tecnologias de frontend
    if (
      description.toLowerCase().includes('react') ||
      context?.technologies?.includes('react')
    )
      knowledge.add('React');

    if (
      description.toLowerCase().includes('next') ||
      context?.technologies?.includes('next')
    )
      knowledge.add('Next.js');

    // Conhecimentos gerais de desenvolvimento
    knowledge.add('TypeScript');

    if (
      description.toLowerCase().includes('database') ||
      description.toLowerCase().includes('model') ||
      description.toLowerCase().includes('entity')
    )
      knowledge.add('Database Design');

    return Array.from(knowledge);
  }

  private suggestSubtasks(
    description: string,
    context?: Record<string, any>,
  ): string[] {
    // Na implementação real, isso seria feito por um modelo de IA
    const subtasks = [];

    if (this.inferDomain(description) === 'backend-development') {
      subtasks.push('Definir estrutura do controller');
      subtasks.push('Implementar endpoints REST');
      subtasks.push('Criar DTOs de validação');
      subtasks.push('Implementar lógica de serviço');
      subtasks.push('Adicionar documentação Swagger');
      subtasks.push('Escrever testes unitários');
    }

    if (this.inferDomain(description) === 'frontend-development') {
      subtasks.push('Criar componentes React');
      subtasks.push('Implementar hooks personalizados');
      subtasks.push('Estilizar componentes');
      subtasks.push('Implementar integração com API');
      subtasks.push('Adicionar testes de componentes');
    }

    if (this.inferDomain(description) === 'data-modeling') {
      subtasks.push('Definir entidades e relacionamentos');
      subtasks.push('Criar esquema Prisma');
      subtasks.push('Definir índices e restrições');
      subtasks.push('Preparar migrações');
    }

    return subtasks;
  }

  private estimateExecutionTime(description: string): string {
    const complexity = this.estimateComplexity(description);

    switch (complexity) {
      case 'low':
        return '30-60 minutos';
      case 'medium':
        return '1-3 horas';
      case 'high':
        return '4-8 horas';
      default:
        return 'Não foi possível estimar';
    }
  }

  private identifyDependencies(
    description: string,
    context?: Record<string, any>,
  ): string[] {
    const dependencies = [];

    // Dependências comuns baseadas no domínio
    if (this.inferDomain(description) === 'backend-development') {
      dependencies.push('Definição do modelo de dados');
      dependencies.push('Configuração de conexão com banco de dados');
    }

    if (this.inferDomain(description) === 'frontend-development') {
      dependencies.push('API backend implementada');
      dependencies.push('Design de interface definido');
    }

    return dependencies;
  }

  private recommendAgents(
    description: string,
    context?: Record<string, any>,
  ): string[] {
    const domain = this.inferDomain(description);

    switch (domain) {
      case 'backend-development':
        return ['Backend Developer', 'Database Designer'];
      case 'frontend-development':
        return ['Frontend Developer', 'UI Designer'];
      case 'data-modeling':
        return ['Database Designer', 'Backend Developer'];
      default:
        return ['Fullstack Developer'];
    }
  }
}
