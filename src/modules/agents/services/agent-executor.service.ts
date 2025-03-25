// src/modules/agents/services/agent-executor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { AgentManagerService } from './agent-manager.service';

@Injectable()
export class AgentExecutorService {
  private readonly logger = new Logger(AgentExecutorService.name);

  constructor(private agentManagerService: AgentManagerService) {}

  async executeTask(
    crewId: string,
    taskId: string,
    input?: Record<string, any>,
  ): Promise<Agent.ExecutionResult> {
    try {
      const crew = await this.agentManagerService.getCrew(crewId);
      this.logger.log(`Executing task ${taskId} with crew ${crewId}`);

      const result = await crew.runTask(taskId, input);

      this.logger.log(
        `Task execution completed with ${result.success ? 'success' : 'failure'}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error executing task: ${error.message}`);
      throw error;
    }
  }

  async executeBackendTask(input: {
    resource: string;
    endpoints: string[];
    methods: string[];
  }): Promise<string> {
    try {
      // Criar crew backend se não existir
      const existingCrews = Array.from(
        this.agentManagerService['crews'].values(),
      ).filter((crew) =>
        crew.agents.some(
          (agent: Agent.Config) => agent.role === 'Backend Developer',
        ),
      );

      const crewId =
        existingCrews.length > 0
          ? existingCrews[0].id
          : await this.agentManagerService.createBackendCrew();

      const result = await this.executeTask(crewId, 'create-api', input);

      return result.output;
    } catch (error) {
      this.logger.error(`Error executing backend task: ${error.message}`);
      throw error;
    }
  }

  async executeFullStackTask(input: {
    feature: string;
    endpoints: string[];
    components: string[];
  }): Promise<Record<string, string>> {
    try {
      // Criar crew fullstack se não existir
      const existingCrews = Array.from(
        this.agentManagerService['crews'].values(),
      ).filter(
        (crew) =>
          crew.agents.some(
            (agent: Agent.Config) => agent.role === 'Backend Developer',
          ) &&
          crew.agents.some(
            (agent: Agent.Config) => agent.role === 'Frontend Developer',
          ),
      );

      const crewId =
        existingCrews.length > 0
          ? existingCrews[0].id
          : await this.agentManagerService.createFullStackCrew();

      const result = await this.executeTask(
        crewId,
        'create-fullstack-feature',
        input,
      );

      // Em uma implementação real, você poderia ter resultados separados para backend e frontend
      return {
        backend: result.output.split('FRONTEND')[0].trim(),
        frontend:
          result.output.split('FRONTEND')[1]?.trim() ||
          'No frontend code generated',
      };
    } catch (error) {
      this.logger.error(`Error executing fullstack task: ${error.message}`);
      throw error;
    }
  }
}
