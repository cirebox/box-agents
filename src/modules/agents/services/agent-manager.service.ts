// src/modules/agents/services/agent-manager.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { AgentFactoryService } from './agent-factory.service';

@Injectable()
export class AgentManagerService {
  private agents: Map<string, any> = new Map();
  private crews: Map<string, any> = new Map();
  private readonly logger = new Logger(AgentManagerService.name);

  constructor(private agentFactoryService: AgentFactoryService) {}

  async createAgent(config: Agent.Config): Promise<string> {
    try {
      const agent = await this.agentFactoryService.createAgent(config);
      this.agents.set(agent.id, agent);
      this.logger.log(`Agent created with ID: ${agent.id}`);
      return agent.id;
    } catch (error) {
      this.logger.error(`Error creating agent: ${error.message}`);
      throw error;
    }
  }

  async getAgent(id: string): Promise<any> {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new Error(`Agent with ID ${id} not found`);
    }
    return agent;
  }

  async createCrew(config: Agent.CrewConfig): Promise<string> {
    try {
      const crewId = `crew-${Date.now()}`;
      const crewAgents = await Promise.all(
        config.agents.map((agentConfig) =>
          this.agentFactoryService.createAgent(agentConfig),
        ),
      );

      // Em uma implementação real com o Crew AI, você usaria a biblioteca para criar o crew
      // Este é um exemplo simplificado
      const crew = {
        id: crewId,
        agents: crewAgents,
        tasks: config.tasks,
        async runTask(
          taskId: string,
          input?: Record<string, any>,
        ): Promise<Agent.ExecutionResult> {
          const task: Agent.Task = this.tasks.find(
            (t: Agent.Task) => t.id === taskId,
          );
          if (!task) {
            throw new Error(`Task with ID ${taskId} not found`);
          }

          // Lógica para determinar qual agente deve executar a tarefa
          const selectedAgent = this.agents[0]; // Simplificado para o exemplo

          const startTime = Date.now();
          let output: string;
          let success = true;

          try {
            output = await selectedAgent.generateResponse(
              `Task: ${task.description}\nContext: ${JSON.stringify(task.context || {})}\nExpected Output: ${task.expectedOutput}\nInput: ${JSON.stringify(input || {})}`,
            );
          } catch (error) {
            output = `Error: ${error.message}`;
            success = false;
          }

          const executionTime = Date.now() - startTime;

          return {
            taskId,
            agentId: selectedAgent.id,
            output,
            success,
            executionTime,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          };
        },
      };

      this.crews.set(crewId, crew);
      this.logger.log(`Crew created with ID: ${crewId}`);
      return crewId;
    } catch (error) {
      this.logger.error(`Error creating crew: ${error.message}`);
      throw error;
    }
  }

  async getCrew(id: string): Promise<any> {
    const crew = this.crews.get(id);
    if (!crew) {
      throw new Error(`Crew with ID ${id} not found`);
    }
    return crew;
  }

  async createBackendCrew(): Promise<string> {
    const backendAgent = await this.agentFactoryService.createBackendAgent();
    const dbDesignerAgent = await this.agentFactoryService.createAgent({
      id: `db-designer-${Date.now()}`,
      role: 'Database Designer',
      goal: 'Design efficient and normalized database schemas',
      backstory:
        'I am a database expert specializing in PostgreSQL schema design.',
    });

    const devOpsAgent = await this.agentFactoryService.createAgent({
      id: `devops-${Date.now()}`,
      role: 'DevOps Engineer',
      goal: 'Set up and manage infrastructure and deployment pipelines',
      backstory:
        'I am a DevOps specialist with expertise in Docker, Kubernetes, and CI/CD.',
    });

    return this.createCrew({
      agents: [backendAgent, dbDesignerAgent, devOpsAgent],
      tasks: [
        {
          id: 'create-api',
          description: 'Create a complete REST API for a given resource',
          expectedOutput:
            'Complete NestJS module with controller, service, and DTOs',
        },
        {
          id: 'design-schema',
          description: 'Design database schema for a given domain',
          expectedOutput: 'Prisma schema and migration files',
        },
        {
          id: 'setup-deployment',
          description: 'Create deployment configuration',
          expectedOutput: 'Docker and Kubernetes configuration files',
        },
      ],
      verbose: true,
    });
  }

  async createFullStackCrew(): Promise<string> {
    const backendAgent = await this.agentFactoryService.createBackendAgent();
    const frontendAgent = await this.agentFactoryService.createFrontendAgent();
    const devOpsAgent = await this.agentFactoryService.createAgent({
      id: `devops-${Date.now()}`,
      role: 'DevOps Engineer',
      goal: 'Set up and manage infrastructure and deployment pipelines',
      backstory:
        'I am a DevOps specialist with expertise in Docker, Kubernetes, and CI/CD.',
    });

    return this.createCrew({
      agents: [backendAgent, frontendAgent, devOpsAgent],
      tasks: [
        {
          id: 'create-fullstack-feature',
          description: 'Create a complete full-stack feature',
          expectedOutput: 'Backend API and Frontend components',
        },
      ],
      verbose: true,
    });
  }
}
