// src/modules/agents/services/update-agent.service.ts
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentManagerService } from './agent-manager.service';
import { IAgentRepository } from 'src/shared/repositories/interfaces/iagent.repository';

interface UpdateAgentParams {
  id: string;
  role?: string;
  goal?: string;
  backstory?: string;
  tools?: any[];
  allowDelegation?: boolean;
}

@Injectable()
export class UpdateAgentService {
  private readonly logger = new Logger(UpdateAgentService.name);

  constructor(
    private agentManagerService: AgentManagerService,
    @Inject('IAgentRepository')
    private agentRepository: IAgentRepository,
  ) { }

  async execute(params: UpdateAgentParams): Promise<void> {
    this.logger.log(`Updating agent with ID: ${params.id}`);

    try {
      const agent = await this.agentRepository.findById(params.id);

      if (!agent) {
        throw new NotFoundException(`Agent with ID ${params.id} not found`);
      }

      // Atualizar apenas os campos fornecidos
      const updatedAgent = {
        ...agent,
        ...(params.role && { role: params.role }),
        ...(params.goal && { goal: params.goal }),
        ...(params.backstory && { backstory: params.backstory }),
        ...(params.tools && { tools: params.tools }),
        ...(params.allowDelegation !== undefined && {
          allowDelegation: params.allowDelegation,
        }),
      };

      await this.agentRepository.update(params.id, updatedAgent);

      this.logger.log(`Agent updated successfully with ID: ${params.id}`);
    } catch (error) {
      this.logger.error(`Failed to update agent: ${error.message}`);
      throw error;
    }
  }
}
