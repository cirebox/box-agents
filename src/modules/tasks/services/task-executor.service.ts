// src/modules/tasks/services/task-executor.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ITaskRepository } from 'src/shared/repositories/interfaces/itask.repository';
import { TaskManagerService } from './task-manager.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { AIProviderFactory } from 'src/shared/providers/ai-provider.factory';
import { PromptEngineeringHelper } from 'src/shared/helpers/prompt-engineering.helper';

interface ExecuteParams {
  taskId: string;
  agentId: string;
  crewId?: string;
  input?: Record<string, any>;
  modelName?: string;
  temperature?: number;
  sessionId?: string;
  saveHistory?: boolean;
}

@Injectable()
export class TaskExecutorService {
  private readonly logger = new Logger(TaskExecutorService.name);
  private activeExecutions: Map<string, Task.Execution> = new Map();

  constructor(
    private taskRepository: ITaskRepository,
    private taskManager: TaskManagerService,
    private eventEmitter: EventEmitter2,
    private aiProviderFactory: AIProviderFactory,
    private promptHelper: PromptEngineeringHelper,
  ) {}

  async execute(params: ExecuteParams): Promise<any> {
    this.logger.log(
      `Executing task ${params.taskId} with agent ${params.agentId}`,
    );

    try {
      // Buscar a tarefa
      const task = await this.taskManager.getTask(params.taskId);

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
      this.eventEmitter.emit('task_execution_started', {
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
          params.modelName || 'default',
        );

        // Construir o prompt para a tarefa
        let prompt: string;

        if (task.templateId) {
          // Usar template se existir
          const template = await this.taskManager.getTemplate(task.templateId);
          if (template) {
            // Substituir variáveis no template
            prompt = this.replaceTemplateVariables(template.promptTemplate, {
              ...execution.input,
              taskDescription: task.description,
              expectedOutput: task.expectedOutput || '',
              context: JSON.stringify(task.context || {}),
            });
          } else {
            // Template não encontrado, construir prompt genérico
            prompt = this.buildGenericPrompt(task, execution.input);
          }
        } else {
          // Sem template, construir prompt genérico
          prompt = this.buildGenericPrompt(task, execution.input);
        }

        // Executar no modelo de IA
        const startExecTime = Date.now();
        const output = await aiProvider.generateText(prompt, {
          temperature: params.temperature || 0.7,
        });
        const endExecTime = Date.now();

        // Atualizar registro de execução com sucesso
        execution.output = output;
        execution.status = 'completed';
        execution.finishedAt = new Date();
        execution.executionTime = endExecTime - startExecTime;
        execution.logs.push({
          timestamp: new Date(),
          level: 'info',
          message: 'Execution completed successfully',
        });

        // Emitir evento de conclusão
        this.eventEmitter.emit('task_execution_completed', {
          executionId,
          taskId: params.taskId,
          agentId: params.agentId,
          output,
          success: true,
          executionTime: execution.executionTime,
        });

        // Se foi solicitado para salvar, persistir no repositório
        if (params.saveHistory !== false) {
          await this.taskRepository.saveExecution(execution);
        }

        // Criar o resultado para retornar
        const result: Task.Result = {
          taskId: params.taskId,
          executionId,
          output,
          success: true,
          executionTime: execution.executionTime,
          metadata: {
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
        this.eventEmitter.emit('task_execution_failed', {
          executionId,
          taskId: params.taskId,
          agentId: params.agentId,
          error: error.message,
          autoRetry: false, // Não retentar automaticamente neste caso
        });

        // Se foi solicitado para salvar, persistir no repositório
        if (params.saveHistory !== false) {
          await this.taskRepository.saveExecution(execution);
        }

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
        this.eventEmitter.emit('task_execution_cancelled', {
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
        if (storedExecution.status === 'in-progress') {
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
          this.eventEmitter.emit('task_execution_cancelled', {
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

      // Buscar a tarefa associada
      const task = await this.taskManager.getTask(originalExecution.taskId);

      if (!task) {
        throw new NotFoundException(
          `Task with ID ${originalExecution.taskId} not found`,
        );
      }

      // Executar novamente com os mesmos parâmetros
      const result = await this.execute({
        taskId: originalExecution.taskId,
        agentId: originalExecution.agentId,
        crewId: originalExecution.crewId,
        input: originalExecution.input,
      });

      this.logger.log(
        `Execution retried successfully, new execution ID: ${result.executionId}`,
      );
      return result.executionId;
    } catch (error) {
      this.logger.error(`Error retrying execution: ${error.message}`);
      throw error;
    }
  }

  // Métodos auxiliares

  private prepareExecutionContext(
    task: Task.Config,
    input: Record<string, any>,
  ): Record<string, any> {
    // Combinar o contexto da tarefa com os parâmetros de entrada
    return {
      ...(task.context || {}),
      ...input,
      taskId: task.id,
      taskDescription: task.description,
      expectedOutput: task.expectedOutput,
    };
  }

  private replaceTemplateVariables(
    template: string,
    variables: Record<string, any>,
  ): string {
    let result = template;

    // Substituir cada variável no formato {{variableName}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    });

    return result;
  }

  private buildGenericPrompt(
    task: Task.Config,
    input: Record<string, any>,
  ): string {
    // Construir um prompt genérico baseado na descrição da tarefa e nos inputs
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
