// src/modules/agents/services/delete-agent.service.ts
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAgentRepository } from 'src/shared/repositories/interfaces/iagent.repository';

@Injectable()
export class DeleteAgentService {
  private readonly logger = new Logger(DeleteAgentService.name);

  constructor(@Inject('IAgentRepository')
  private agentRepository: IAgentRepository,) { }

  async execute(id: string): Promise<void> {
    this.logger.log(`Deleting agent with ID: ${id}`);

    try {
      const agent = await this.agentRepository.findById(id);

      if (!agent) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }

      await this.agentRepository.delete(id);

      this.logger.log(`Agent deleted successfully with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete agent: ${error.message}`);
      throw error;
    }
  }
}
