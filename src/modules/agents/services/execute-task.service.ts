// src/modules/agents/services/execute-task.service.ts
import { Injectable, Logger, } from '@nestjs/common';
import { AgentExecutorService } from './agent-executor.service';

interface ExecuteTaskParams {
  crewId: string;
  taskId: string;
  input?: Record<string, any>;
}

interface ExecuteBackendTaskParams {
  resource: string;
  endpoints: string[];
  methods: string[];
}

interface ExecuteFullStackTaskParams {
  feature: string;
  endpoints: string[];
  components: string[];
}

@Injectable()
export class ExecuteTaskService {
  private readonly logger = new Logger(ExecuteTaskService.name);

  constructor(private agentExecutorService: AgentExecutorService) { }

  async execute(params: ExecuteTaskParams): Promise<any> {
    this.logger.log(
      `Executing task ${params.taskId} with crew ${params.crewId}`,
    );

    try {
      const result = await this.agentExecutorService.executeTask(
        params.crewId,
        params.taskId,
        params.input,
      );

      this.logger.log(`Task executed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute task: ${error.message}`);
      throw error;
    }
  }

  async executeBackendTask(params: ExecuteBackendTaskParams): Promise<string> {
    this.logger.log(`Executing backend task for resource: ${params.resource}`);

    try {
      const result = await this.agentExecutorService.executeBackendTask({
        resource: params.resource,
        endpoints: params.endpoints,
        methods: params.methods,
      });

      this.logger.log(`Backend task executed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute backend task: ${error.message}`);
      throw error;
    }
  }

  async executeFullStackTask(
    params: ExecuteFullStackTaskParams,
  ): Promise<Record<string, string>> {
    this.logger.log(`Executing full-stack task for feature: ${params.feature}`);

    try {
      const result = await this.agentExecutorService.executeFullStackTask({
        feature: params.feature,
        endpoints: params.endpoints,
        components: params.components,
      });

      this.logger.log(`Full-stack task executed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute full-stack task: ${error.message}`);
      throw error;
    }
  }
}
