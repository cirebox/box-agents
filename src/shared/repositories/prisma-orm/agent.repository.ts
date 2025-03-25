// src/shared/repositories/prisma-orm/agent.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { IAgentRepository } from '../interfaces/iagent.repository';

@Injectable()
export class AgentPrismaRepository implements IAgentRepository {
  private readonly logger = new Logger(AgentPrismaRepository.name);

  constructor(private prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    try {
      // Adaptar os dados para o formato esperado pelo Prisma
      const prismaData = {
        id: data.id,
        role: data.role,
        goal: data.goal,
        backstory: data.backstory,
        allowDelegation: data.allowDelegation || false,
        modelName: data.modelName || 'gpt-4',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Converter ferramentas para o formato JSON para armazenamento
        tools: data.tools ? JSON.stringify(data.tools) : null,
      };

      const agent = await this.prisma.agent.create({
        data: prismaData,
      });

      return {
        ...agent,
        tools: agent.tools ? JSON.parse(agent.tools as string) : null,
      };
    } catch (error) {
      this.logger.error(`Error creating agent: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, data: any): Promise<any> {
    try {
      // Remover campos nulos ou indefinidos
      const updateData: Record<string, any> = Object.entries(data).reduce(
        (acc: Record<string, any>, [key, value]) => {
          if (value !== null && value !== undefined) {
            if (key === 'tools' && value) {
              acc[key] = JSON.stringify(value);
            } else {
              acc[key] = value;
            }
          }
          return acc;
        },
        {},
      );

      // Adicionar timestamp de atualização
      updateData['updatedAt'] = new Date();

      const agent = await this.prisma.agent.update({
        where: { id },
        data: updateData,
      });

      return {
        ...agent,
        tools: agent.tools ? JSON.parse(agent.tools as string) : null,
      };
    } catch (error) {
      this.logger.error(`Error updating agent: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.agent.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error deleting agent: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<any> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id },
      });

      if (!agent) {
        return null;
      }

      return {
        ...agent,
        tools: agent.tools ? JSON.parse(agent.tools as string) : null,
      };
    } catch (error) {
      this.logger.error(`Error finding agent by ID: ${error.message}`);
      throw error;
    }
  }

  async findAll(filters?: Record<string, any>): Promise<any[]> {
    try {
      // Construir o filtro para o Prisma
      const where: Record<string, any> = {};

      if (filters) {
        // Adicionar condições baseadas nos filtros fornecidos
        if (filters.role) {
          where['role'] = { contains: filters.role, mode: 'insensitive' };
        }

        if (filters.modelName) {
          where['modelName'] = filters.modelName;
        }

        // Adicionar outras condições de filtro conforme necessário
      }

      const agents = await this.prisma.agent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return agents.map((agent) => ({
        ...agent,
        tools: agent.tools ? JSON.parse(agent.tools as string) : null,
      }));
    } catch (error) {
      this.logger.error(`Error finding agents: ${error.message}`);
      throw error;
    }
  }
}
