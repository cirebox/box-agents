// src/modules/tasks/controllers/mq.controller.ts
import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  EventPattern,
} from '@nestjs/microservices';
import { TaskManagerService } from '../services/task-manager.service';
import { TaskExecutorService } from '../services/task-executor.service';
import { CreateTaskService } from '../services/create-task.service';
import { ExecuteTaskService } from '../services/execute-task.service';
import { FindTaskService } from '../services/find-task.service';
import { UpdateTaskService } from '../services/update-task.service';
import { DeleteTaskService } from '../services/delete-task.service';
import { TrackTaskService } from '../services/track-task.service';

@Controller()
export class TasksMqController {
  private readonly logger = new Logger(TasksMqController.name);

  constructor(
    private readonly taskManagerService: TaskManagerService,
    private readonly taskExecutorService: TaskExecutorService,
    private readonly createTaskService: CreateTaskService,
    private readonly executeTaskService: ExecuteTaskService,
    private readonly findTaskService: FindTaskService,
    private readonly updateTaskService: UpdateTaskService,
    private readonly deleteTaskService: DeleteTaskService,
    private readonly trackTaskService: TrackTaskService,
  ) {}

  @MessagePattern('create_task')
  async createTask(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for create_task: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received create_task request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const taskId = await this.createTaskService.execute({
        description: data.description,
        expectedOutput: data.expectedOutput,
        context: data.context,
        priority: data.priority,
        deadline: data.deadline,
        assignedAgentId: data.assignedAgentId,
        assignedCrewId: data.assignedCrewId,
        dependencies: data.dependencies,
        tags: data.tags,
        templateId: data.templateId,
      });

      channel.ack(originalMsg);
      return { taskId, success: true };
    } catch (error) {
      this.logger.error(`Error creating task via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('execute_task')
  async executeTask(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for execute_task: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received execute_task request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const result = await this.executeTaskService.execute({
        taskId: data.taskId,
        agentId: data.agentId,
        crewId: data.crewId,
        input: data.input || {},
      });

      channel.ack(originalMsg);
      return { result, success: true };
    } catch (error) {
      this.logger.error(`Error executing task via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('get_task')
  async getTask(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(`Payload received for get_task: ${JSON.stringify(data)}`);
    this.logger.log(
      `Received get_task request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const task = await this.findTaskService.findById(data.taskId);

      channel.ack(originalMsg);
      return { task, success: true };
    } catch (error) {
      this.logger.error(`Error getting task via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('find_tasks')
  async findTasks(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for find_tasks: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received find_tasks request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const tasks = await this.findTaskService.findAll(data.filters || {});

      channel.ack(originalMsg);
      return { tasks, success: true };
    } catch (error) {
      this.logger.error(`Error finding tasks via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('update_task')
  async updateTask(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for update_task: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received update_task request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.updateTaskService.execute(data.taskId, data.updates);

      channel.ack(originalMsg);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error updating task via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('delete_task')
  async deleteTask(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for delete_task: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received delete_task request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.deleteTaskService.execute(data.taskId);

      channel.ack(originalMsg);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting task via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('get_task_execution')
  async getTaskExecution(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for get_task_execution: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received get_task_execution request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const execution = await this.trackTaskService.getExecution(
        data.executionId,
      );

      channel.ack(originalMsg);
      return { execution, success: true };
    } catch (error) {
      this.logger.error(
        `Error getting task execution via MQ: ${error.message}`,
      );
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('get_task_executions')
  async getTaskExecutions(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for get_task_executions: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received get_task_executions request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const executions = await this.trackTaskService.getTaskExecutions(
        data.taskId,
      );

      channel.ack(originalMsg);
      return { executions, success: true };
    } catch (error) {
      this.logger.error(
        `Error getting task executions via MQ: ${error.message}`,
      );
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('cancel_execution')
  async cancelExecution(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for cancel_execution: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received cancel_execution request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.executeTaskService.cancelExecution(data.executionId);

      channel.ack(originalMsg);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error cancelling execution via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('retry_execution')
  async retryExecution(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for retry_execution: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received retry_execution request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const newExecutionId = await this.executeTaskService.retryExecution(
        data.executionId,
      );

      channel.ack(originalMsg);
      return { executionId: newExecutionId, success: true };
    } catch (error) {
      this.logger.error(`Error retrying execution via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('batch_create_tasks')
  async batchCreateTasks(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for batch_create_tasks: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received batch_create_tasks request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const taskIds = await this.createTaskService.batchCreate(data.tasks);

      channel.ack(originalMsg);
      return { taskIds, success: true };
    } catch (error) {
      this.logger.error(`Error batch creating tasks via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('analyze_task')
  async analyzeTask(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for analyze_task: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received analyze_task request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const analysis = await this.taskManagerService.analyzeTask(
        data.description,
        data.context,
      );

      channel.ack(originalMsg);
      return { analysis, success: true };
    } catch (error) {
      this.logger.error(`Error analyzing task via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Handlers para eventos (EventPattern)

  @EventPattern('task_created')
  async handleTaskCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for task_created: ${JSON.stringify(data)}`,
    );
    this.logger.log(`Received task_created event: ${JSON.stringify(data)}`);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Lógica para notificar sistemas externos ou outros serviços
      // sobre a criação de uma nova tarefa

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error handling task_created event: ${error.message}`);
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern('task_execution_started')
  async handleTaskExecutionStarted(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.logger.debug(
      `Payload received for task_execution_started: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received task_execution_started event: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Lógica para registrar início de execução ou atualizar status em sistemas externos
      await this.trackTaskService.trackExecutionStart(data.executionId);

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Error handling task_execution_started event: ${error.message}`,
      );
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern('task_execution_completed')
  async handleTaskExecutionCompleted(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.logger.debug(
      `Payload received for task_execution_completed: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received task_execution_completed event: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Lógica para registrar conclusão da execução e atualizar métricas
      await this.trackTaskService.trackExecutionCompletion(
        data.executionId,
        data.output,
        data.success,
        data.metrics,
      );

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Error handling task_execution_completed event: ${error.message}`,
      );
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern('task_execution_failed')
  async handleTaskExecutionFailed(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.logger.debug(
      `Payload received for task_execution_failed: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received task_execution_failed event: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Lógica para registrar falha na execução e possível tentativa de recuperação
      await this.trackTaskService.trackExecutionFailure(
        data.executionId,
        data.error,
        data.metrics,
      );

      // Verificar se deve tentar novamente automaticamente com base em políticas
      if (data.autoRetry) {
        await this.executeTaskService.retryExecution(data.executionId);
      }

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Error handling task_execution_failed event: ${error.message}`,
      );
      channel.nack(originalMsg, false, false);
    }
  }
}
