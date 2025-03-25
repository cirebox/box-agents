// src/modules/agents/services/create-agent.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { AgentManagerService } from './agent-manager.service';

interface CreateAgentParams {
  role: string;
  goal: string;
  backstory: string;
  tools?: any[];
  allowDelegation?: boolean;
  modelName?: string;
}

@Injectable()
export class CreateAgentService {
  private readonly logger = new Logger(CreateAgentService.name);

  constructor(private agentManagerService: AgentManagerService) {}

  async execute(params: CreateAgentParams): Promise<string> {
    this.logger.log(`Creating agent with role: ${params.role}`);

    try {
      const agentId = await this.agentManagerService.createAgent({
        id: `agent-${Date.now()}`,
        role: params.role,
        goal: params.goal,
        backstory: params.backstory,
        tools: params.tools,
        allowDelegation: params.allowDelegation,
      });

      this.logger.log(`Agent created successfully with ID: ${agentId}`);
      return agentId;
    } catch (error) {
      this.logger.error(`Failed to create agent: ${error.message}`);
      throw error;
    }
  }
}
