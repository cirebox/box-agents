// src/modules/agents/controllers/mq.controller.ts
import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  EventPattern,
} from '@nestjs/microservices';
import { AgentManagerService } from '../services/agent-manager.service';
import { AgentExecutorService } from '../services/agent-executor.service';
import { CreateAgentService } from '../services/create-agent.service';
import { CreateCrewService } from '../services/create-crew.service';
import { ExecuteTaskService } from '../services/execute-task.service';

@Controller()
export class AgentsMqController {
  private readonly logger = new Logger(AgentsMqController.name);

  constructor(
    private readonly agentManagerService: AgentManagerService,
    private readonly agentExecutorService: AgentExecutorService,
    private readonly createAgentService: CreateAgentService,
    private readonly createCrewService: CreateCrewService,
    private readonly executeTaskService: ExecuteTaskService,
  ) {}

  @MessagePattern('create_agent')
  async createAgent(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for create_agent: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received create_agent request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const agentId = await this.createAgentService.execute({
        role: data.role,
        goal: data.goal,
        backstory: data.backstory,
        tools: data.tools,
        allowDelegation: data.allowDelegation,
        modelName: data.modelName,
      });

      channel.ack(originalMsg);
      return { agentId, success: true };
    } catch (error) {
      this.logger.error(`Error creating agent via MQ: ${error.message}`);
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('create_crew')
  async createCrew(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for create_crew: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received create_crew request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const crewId = await this.createCrewService.execute({
        agents: data.agents,
        tasks: data.tasks,
        verbose: data.verbose,
      });

      channel.ack(originalMsg);
      return { crewId, success: true };
    } catch (error) {
      this.logger.error(`Error creating crew via MQ: ${error.message}`);
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
        crewId: data.crewId,
        taskId: data.taskId,
        input: data.input,
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

  @MessagePattern('execute_backend_task')
  async executeBackendTask(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for execute_backend_task: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received execute_backend_task request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const result = await this.executeTaskService.executeBackendTask({
        resource: data.resource,
        endpoints: data.endpoints,
        methods: data.methods,
      });

      channel.ack(originalMsg);
      return { result, success: true };
    } catch (error) {
      this.logger.error(
        `Error executing backend task via MQ: ${error.message}`,
      );
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('execute_fullstack_task')
  async executeFullStackTask(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(
      `Payload received for execute_fullstack_task: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received execute_fullstack_task request via MQ: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const result = await this.executeTaskService.executeFullStackTask({
        feature: data.feature,
        endpoints: data.endpoints,
        components: data.components,
      });

      channel.ack(originalMsg);
      return { result, success: true };
    } catch (error) {
      this.logger.error(
        `Error executing fullstack task via MQ: ${error.message}`,
      );
      channel.nack(originalMsg, false, false);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @EventPattern('agent_task_completed')
  async handleAgentTaskCompleted(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.logger.debug(
      `Payload received for agent_task_completed: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received agent_task_completed event: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Aqui você pode implementar a lógica para lidar com a conclusão da tarefa
      // Por exemplo, atualizar o status no banco de dados, notificar outros sistemas, etc.

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Error handling agent_task_completed event: ${error.message}`,
      );
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern('agent_task_failed')
  async handleAgentTaskFailed(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.logger.debug(
      `Payload received for agent_task_failed: ${JSON.stringify(data)}`,
    );
    this.logger.log(
      `Received agent_task_failed event: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Aqui você pode implementar a lógica para lidar com falhas de tarefas
      // Por exemplo, registrar o erro, tentar novamente, notificar sistemas de monitoramento, etc.

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Error handling agent_task_failed event: ${error.message}`,
      );
      channel.nack(originalMsg, false, false);
    }
  }
}
