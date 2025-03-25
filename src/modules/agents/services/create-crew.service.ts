// src/modules/agents/services/create-crew.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { AgentManagerService } from './agent-manager.service';

interface CreateCrewParams {
  agents: any[];
  tasks: any[];
  verbose?: boolean;
}

@Injectable()
export class CreateCrewService {
  private readonly logger = new Logger(CreateCrewService.name);

  constructor(private agentManagerService: AgentManagerService) {}

  async execute(params: CreateCrewParams): Promise<string> {
    this.logger.log(
      `Creating crew with ${params.agents.length} agents and ${params.tasks.length} tasks`,
    );

    try {
      const crewId = await this.agentManagerService.createCrew({
        agents: params.agents,
        tasks: params.tasks,
        verbose: params.verbose,
      });

      this.logger.log(`Crew created successfully with ID: ${crewId}`);
      return crewId;
    } catch (error) {
      this.logger.error(`Failed to create crew: ${error.message}`);
      throw error;
    }
  }
}
