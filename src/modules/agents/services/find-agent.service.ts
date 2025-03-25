// src/modules/agents/services/find-agent.service.ts
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAgentRepository } from 'src/shared/repositories/interfaces/iagent.repository';

@Injectable()
export class FindAgentService {
  private readonly logger = new Logger(FindAgentService.name);

  constructor(@Inject('IAgentRepository')
      private agentRepository: IAgentRepository,) {}

  async findById(id: string): Promise<any> {
    this.logger.log(`Finding agent with ID: ${id}`);

    try {
      const agent = await this.agentRepository.findById(id);

      if (!agent) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }

      return agent;
    } catch (error) {
      this.logger.error(`Failed to find agent: ${error.message}`);
      throw error;
    }
  }

  async findAll(filters?: Record<string, any>): Promise<any[]> {
    this.logger.log(
      `Finding all agents with filters: ${JSON.stringify(filters || {})}`,
    );

    try {
      const agents = await this.agentRepository.findAll(filters);
      return agents;
    } catch (error) {
      this.logger.error(`Failed to find agents: ${error.message}`);
      throw error;
    }
  }
}
