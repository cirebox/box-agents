// src/modules/agents/services/agent-factory.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { AIProviderFactory } from '../../../shared/providers/ai-provider.factory';

// Definir a interface Agent.Config correta
interface AgentConfig {
  id: string;
  role: string;
  goal: string;
  backstory: string;
  tools?: any[];
  allowDelegation?: boolean;
  modelName?: string; // Adicionado para corrigir o erro
}

@Injectable()
export class AgentFactoryService {
  private readonly logger = new Logger(AgentFactoryService.name);

  constructor(private aiProviderFactory: AIProviderFactory) {}

  async createAgent(config: AgentConfig): Promise<any> {
    this.logger.log(`Creating agent with role: ${config.role}`);

    // Aqui você implementaria a lógica específica do sistema de agentes
    const provider = this.aiProviderFactory.getProvider(
      config.modelName || 'default',
    );

    const agent = {
      id: config.id,
      role: config.role,
      goal: config.goal,
      backstory: config.backstory,
      tools: config.tools || [],
      allowDelegation: config.allowDelegation || false,
      async generateResponse(prompt: string) {
        return provider.generateText(prompt);
      },
      async generateCode(prompt: string, language: string) {
        return provider.generateCode(prompt, language);
      },
    };

    return agent;
  }

  // Criar diferentes tipos de agentes com configurações pré-definidas
  async createBackendAgent(): Promise<any> {
    return this.createAgent({
      id: `backend-${Date.now()}`,
      role: 'Backend Developer',
      goal: 'Create high-quality NestJS code following best practices and SOLID principles',
      backstory:
        'I am an expert NestJS developer with years of experience in creating scalable backend applications.',
      tools: [
        {
          name: 'generateController',
          description: 'Generate a NestJS controller with endpoints',
          callback: async (params: any) => {
            const provider = this.aiProviderFactory.getProvider('gpt-4');
            return provider.generateCode(
              `Create a NestJS controller for ${params.resource} with the following endpoints: ${params.endpoints.join(', ')}`,
              'typescript',
            );
          },
        },
        {
          name: 'generateService',
          description: 'Generate a NestJS service',
          callback: async (params: any) => {
            const provider = this.aiProviderFactory.getProvider('gpt-4');
            return provider.generateCode(
              `Create a NestJS service for ${params.resource} with the following methods: ${params.methods.join(', ')}`,
              'typescript',
            );
          },
        },
      ],
    });
  }

  async createFrontendAgent(): Promise<any> {
    return this.createAgent({
      id: `frontend-${Date.now()}`,
      role: 'Frontend Developer',
      goal: 'Create beautiful and functional React components using Next.js',
      backstory:
        'I am a frontend expert specializing in React and Next.js applications.',
      tools: [
        {
          name: 'generateComponent',
          description: 'Generate a React component',
          callback: async (params: any) => {
            const provider = this.aiProviderFactory.getProvider('gpt-4');
            return provider.generateCode(
              `Create a React component for ${params.purpose} with the following props: ${JSON.stringify(params.props)}`,
              'typescript',
            );
          },
        },
      ],
    });
  }

  async createMobileAgent(): Promise<any> {
    return this.createAgent({
      id: `mobile-${Date.now()}`,
      role: 'Mobile Developer',
      goal: 'Create cross-platform mobile applications using Flutter',
      backstory:
        'I am a Flutter expert creating beautiful, responsive mobile applications.',
      tools: [
        {
          name: 'generateWidget',
          description: 'Generate a Flutter widget',
          callback: async (params: any) => {
            const provider = this.aiProviderFactory.getProvider('gpt-4');
            return provider.generateCode(
              `Create a Flutter widget for ${params.purpose} with the following parameters: ${JSON.stringify(params.parameters)}`,
              'dart',
            );
          },
        },
      ],
    });
  }
}
