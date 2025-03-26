// src/modules/tasks/services/execute-task.service.ts
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ITaskRepository } from 'src/shared/repositories/interfaces/itask.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AIProviderFactory } from 'src/shared/providers/ai-provider.factory';
import { PromptEngineeringHelper } from 'src/shared/helpers/prompt-engineering.helper';
import { randomUUID } from 'crypto';

interface ExecuteTaskParams {
  taskId: string;
  agentId: string;
  crewId?: string;
  input?: Record<string, any>;
  modelName?: string;
  temperature?: number;
  sessionId?: string;
}

@Injectable()
export class ExecuteTaskService {
  private readonly logger = new Logger(ExecuteTaskService.name);
  private activeExecutions: Map<string, Task.Execution> = new Map();

  constructor(
    @Inject('ITaskRepository')
    private taskRepository: ITaskRepository,
    private eventEmitter: EventEmitter2,
    private aiProviderFactory: AIProviderFactory,
    private promptHelper: PromptEngineeringHelper,
  ) {}

  async execute(params: ExecuteTaskParams): Promise<any> {
    this.logger.log(
      `Executing task ${params.taskId} with agent ${params.agentId}`,
    );

    try {
      // Buscar a tarefa
      const task = await this.taskRepository.findById(params.taskId);

      if (!task) {
        throw new NotFoundException(`Task with ID ${params.taskId} not found`);
      }

      // Criar registro de execução
      const executionId = `exec-${randomUUID()}`;
      const startTime = Date.now();

      const execution: Task.Execution = {
        id: executionId,
        taskId: params.taskId,
        agentId: params.agentId,
        crewId: params.crewId,
        input: params.input || {},
        status: 'in-progress',
        startedAt: new Date(),
        attempts: 1,
        logs: [
          {
            timestamp: new Date(),
            level: 'info',
            message: `Execution started for task: ${task.description}`,
          },
        ],
      };

      // Armazenar a execução ativa
      this.activeExecutions.set(executionId, execution);

      // Emitir evento de início de execução
      this.eventEmitter.emit('task.execution.started', {
        executionId,
        taskId: params.taskId,
        agentId: params.agentId,
        crewId: params.crewId,
      });

      // Log de início
      this.logger.log(`Task execution started with ID: ${executionId}`);

      try {
        // Obter o provider de IA configurado
        const aiProvider = this.aiProviderFactory.getProvider(
          params.modelName || task.templateId
            ? await this.getTemplateModel(task.templateId)
            : 'default',
        );

        // Construir o prompt para a tarefa
        let prompt: string;

        if (task.templateId) {
          // Usar template se existir
          prompt = await this.buildPromptFromTemplate(task, params.input || {});
        } else {
          // Sem template, construir prompt genérico
          prompt = this.buildGenericPrompt(task, params.input || {});
        }

        // Adicionar log do prompt
        execution.logs.push({
          timestamp: new Date(),
          level: 'info',
          message: 'Prompt construído e enviado para o modelo de IA',
          metadata: { prompt },
        });

        // Executar no modelo de IA
        const startExecTime = Date.now();
        const output = await aiProvider.generateText(prompt, {
          temperature: params.temperature || 0.7,
        });
        const endExecTime = Date.now();

        // Calcular métricas
        const executionTime = endExecTime - startExecTime;

        // Atualizar registro de execução com sucesso
        execution.output = output;
        execution.status = 'completed';
        execution.finishedAt = new Date();
        execution.executionTime = executionTime;
        execution.logs.push({
          timestamp: new Date(),
          level: 'info',
          message: 'Execution completed successfully',
          metadata: { executionTime },
        });

        // Emitir evento de conclusão
        this.eventEmitter.emit('task.execution.completed', {
          executionId,
          taskId: params.taskId,
          agentId: params.agentId,
          output,
          success: true,
          executionTime,
        });

        // Persistir no repositório
        await this.taskRepository.saveExecution(execution);

        // Remover da lista de execuções ativas
        this.activeExecutions.delete(executionId);

        // Criar o resultado para retornar
        const result = {
          executionId,
          output,
          success: true,
          executionTime,
          metadata: {
            taskId: params.taskId,
            agentId: params.agentId,
            crewId: params.crewId,
            timestamp: new Date().toISOString(),
          },
        };

        this.logger.log(
          `Task execution completed successfully: ${executionId}`,
        );
        return result;
      } catch (error) {
        // Atualizar registro de execução com falha
        execution.status = 'failed';
        execution.error = error.message;
        execution.finishedAt = new Date();
        execution.executionTime = Date.now() - startTime;
        execution.logs.push({
          timestamp: new Date(),
          level: 'error',
          message: `Execution failed: ${error.message}`,
        });

        // Emitir evento de falha
        this.eventEmitter.emit('task.execution.failed', {
          executionId,
          taskId: params.taskId,
          agentId: params.agentId,
          error: error.message,
          autoRetry: false,
        });

        // Persistir no repositório
        await this.taskRepository.saveExecution(execution);

        // Remover da lista de execuções ativas
        this.activeExecutions.delete(executionId);

        this.logger.error(
          `Task execution failed: ${executionId} - ${error.message}`,
        );
        throw error;
      }
    } catch (error) {
      this.logger.error(`Error during task execution: ${error.message}`);
      throw error;
    }
  }

  async cancelExecution(executionId: string): Promise<void> {
    this.logger.log(`Cancelling execution ${executionId}`);

    try {
      // Verificar se a execução está ativa
      const execution = this.activeExecutions.get(executionId);

      if (execution) {
        // Atualizar o status da execução ativa
        execution.status = 'cancelled';
        execution.finishedAt = new Date();
        execution.executionTime =
          execution.finishedAt.getTime() - execution.startedAt.getTime();
        execution.logs.push({
          timestamp: new Date(),
          level: 'info',
          message: 'Execution cancelled by user',
        });

        // Persistir no repositório
        await this.taskRepository.saveExecution(execution);

        // Remover da lista de execuções ativas
        this.activeExecutions.delete(executionId);

        // Emitir evento de cancelamento
        this.eventEmitter.emit('task.execution.cancelled', {
          executionId,
          taskId: execution.taskId,
          agentId: execution.agentId,
        });

        this.logger.log(`Execution cancelled: ${executionId}`);
      } else {
        // Tentar buscar no repositório
        const storedExecution =
          await this.taskRepository.findExecutionById(executionId);

        if (!storedExecution) {
          throw new NotFoundException(
            `Execution with ID ${executionId} not found`,
          );
        }

        // Só podemos cancelar execuções em progresso
        if (
          storedExecution.status === 'in-progress' ||
          storedExecution.status === 'pending'
        ) {
          // Atualizar status
          storedExecution.status = 'cancelled';
          storedExecution.finishedAt = new Date();
          storedExecution.logs.push({
            timestamp: new Date(),
            level: 'info',
            message: 'Execution cancelled by user',
          });

          // Persistir atualização
          await this.taskRepository.saveExecution(storedExecution);

          // Emitir evento
          this.eventEmitter.emit('task.execution.cancelled', {
            executionId,
            taskId: storedExecution.taskId,
            agentId: storedExecution.agentId,
          });

          this.logger.log(`Stored execution cancelled: ${executionId}`);
        } else {
          this.logger.warn(
            `Cannot cancel execution with status: ${storedExecution.status}`,
          );
          throw new Error(
            `Cannot cancel execution with status: ${storedExecution.status}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error cancelling execution: ${error.message}`);
      throw error;
    }
  }

  async retryExecution(executionId: string): Promise<string> {
    this.logger.log(`Retrying execution ${executionId}`);

    try {
      // Buscar a execução original
      const originalExecution =
        await this.taskRepository.findExecutionById(executionId);

      if (!originalExecution) {
        throw new NotFoundException(
          `Execution with ID ${executionId} not found`,
        );
      }

      // Verificar se a execução pode ser repetida (falhou ou foi cancelada)
      if (
        originalExecution.status !== 'failed' &&
        originalExecution.status !== 'cancelled'
      ) {
        throw new Error(
          `Cannot retry execution with status: ${originalExecution.status}`,
        );
      }

      // Criar uma nova execução baseada na original
      const newExecutionId = `exec-${randomUUID()}`;
      const newExecution: Task.Execution = {
        ...originalExecution,
        id: newExecutionId,
        status: 'pending',
        startedAt: new Date(),
        finishedAt: undefined,
        executionTime: undefined,
        error: undefined,
        attempts: originalExecution.attempts + 1,
        logs: [
          {
            timestamp: new Date(),
            level: 'info',
            message: `Retry of execution ${executionId} started`,
          },
        ],
      };

      // Salvar a nova execução
      await this.taskRepository.saveExecution(newExecution);

      // Emitir evento de nova tentativa
      this.eventEmitter.emit('task.execution.retry', {
        originalExecutionId: executionId,
        newExecutionId,
        taskId: originalExecution.taskId,
        agentId: originalExecution.agentId,
      });

      // Executar novamente
      this.execute({
        taskId: originalExecution.taskId,
        agentId: originalExecution.agentId,
        crewId: originalExecution.crewId,
        input: originalExecution.input,
      }).catch((error) => {
        this.logger.error(`Error in retry execution: ${error.message}`);
      });

      this.logger.log(
        `Execution retry initiated, new execution ID: ${newExecutionId}`,
      );
      return newExecutionId;
    } catch (error) {
      this.logger.error(`Error retrying execution: ${error.message}`);
      throw error;
    }
  }

  // Métodos auxiliares

  private async getTemplateModel(templateId?: string): Promise<string> {
    if (!templateId) return 'default';

    try {
      // Buscar o template no repositório
      const templates = await this.taskRepository.findAllTemplates({
        id: templateId,
      });

      if (templates.length === 0) {
        this.logger.warn(`Template with ID ${templateId} not found`);
        return 'default';
      }

      const template = templates[0];

      // Retornar o modelo padrão do template, se existir
      return template.defaultModelName || 'default';
    } catch (error) {
      this.logger.error(`Error getting template model: ${error.message}`);
      return 'default';
    }
  }

  private async buildPromptFromTemplate(
    task: Task.Config,
    input: Record<string, any>,
  ): Promise<string> {
    if (!task.templateId) {
      return this.buildGenericPrompt(task, input);
    }

    try {
      // Buscar o template no repositório
      const templates = await this.taskRepository.findAllTemplates({
        id: task.templateId,
      });

      if (templates.length === 0) {
        this.logger.warn(
          `Template with ID ${task.templateId} not found, using generic prompt`,
        );
        return this.buildGenericPrompt(task, input);
      }

      const template = templates[0];

      // Criar objeto com todas as variáveis para substituição
      const variables = {
        ...input,
        taskDescription: task.description,
        taskId: task.id,
        expectedOutput: task.expectedOutput || '',
        context: JSON.stringify(task.context || {}),
      };

      // Substituir variáveis no template
      let prompt = template.promptTemplate;

      // Substituir cada variável no formato {{variableName}}
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        prompt = prompt.replace(regex, String(value));
      });

      return prompt;
    } catch (error) {
      this.logger.error(
        `Error building prompt from template: ${error.message}`,
      );
      return this.buildGenericPrompt(task, input);
    }
  }

  private buildGenericPrompt(
    task: Task.Config,
    input: Record<string, any>,
  ): string {
    // Usar o PromptEngineeringHelper para construir um prompt estruturado

    // Dependendo do contexto, podemos usar diferentes tipos de prompt
    if (
      task.description.toLowerCase().includes('code') ||
      task.description.toLowerCase().includes('programming') ||
      task.description.toLowerCase().includes('develop')
    ) {
      // Prompt de geração de código
      return this.promptHelper.buildCodeGenerationPrompt(
        task.description,
        this.inferLanguage(task, input),
        this.inferFrameworks(task, input),
        JSON.stringify(input),
      );
    } else if (
      task.description.toLowerCase().includes('analysis') ||
      task.description.toLowerCase().includes('evaluate') ||
      task.description.toLowerCase().includes('review')
    ) {
      // Prompt de análise
      return this.promptHelper.buildCodeAnalysisPrompt(
        input.codeToAnalyze || JSON.stringify(input),
        'all',
      );
    } else {
      // Prompt genérico com Chain of Thought
      return this.promptHelper.buildChainOfThoughtPrompt({
        question: task.description,
        steps: [
          '1. Entenda o objetivo da tarefa',
          '2. Identifique os parâmetros de entrada disponíveis',
          '3. Determine como abordar a tarefa de forma estruturada',
          '4. Execute a tarefa seguindo as boas práticas',
          '5. Verifique se o resultado atende aos critérios esperados',
        ],
        reasoning: `Esta tarefa envolve: ${task.description}.\n\nOs parâmetros de entrada são: ${JSON.stringify(input, null, 2)}`,
        finalAnswer: task.expectedOutput
          ? `O resultado deve ser: ${task.expectedOutput}`
          : 'Forneça um resultado claro e estruturado.',
      });
    }
  }

  private inferLanguage(task: Task.Config, input: Record<string, any>): string {
    // Tenta inferir a linguagem a partir do input ou contexto da tarefa
    if (input.language) return input.language;

    if (task.context && task.context.language) return task.context.language;

    // Inferir da descrição
    const description = task.description.toLowerCase();

    if (description.includes('typescript') || description.includes('ts'))
      return 'typescript';
    if (description.includes('javascript') || description.includes('js'))
      return 'javascript';
    if (description.includes('python')) return 'python';
    if (description.includes('java')) return 'java';
    if (description.includes('c#') || description.includes('csharp'))
      return 'csharp';
    if (description.includes('rust')) return 'rust';
    if (description.includes('go')) return 'go';

    // Baseado nas preferências do projeto
    return 'typescript'; // Default para o projeto
  }

  private inferFrameworks(
    task: Task.Config,
    input: Record<string, any>,
  ): string {
    // Tenta inferir os frameworks a partir do input ou contexto da tarefa
    if (input.frameworks) {
      return Array.isArray(input.frameworks)
        ? input.frameworks.join(', ')
        : input.frameworks;
    }

    if (task.context && task.context.frameworks) {
      return Array.isArray(task.context.frameworks)
        ? task.context.frameworks.join(', ')
        : task.context.frameworks;
    }

    // Inferir da descrição
    const description = task.description.toLowerCase();
    const frameworks = [];

    if (description.includes('nestjs') || description.includes('nest.js'))
      frameworks.push('NestJS');
    if (description.includes('react') || description.includes('reactjs'))
      frameworks.push('React');
    if (description.includes('next') || description.includes('next.js'))
      frameworks.push('Next.js');
    if (description.includes('express')) frameworks.push('Express');
    if (description.includes('prisma')) frameworks.push('Prisma');
    if (description.includes('django')) frameworks.push('Django');
    if (description.includes('flask')) frameworks.push('Flask');

    // Baseado nas preferências do projeto
    return frameworks.length > 0 ? frameworks.join(', ') : 'NestJS, Prisma';
  }
}
