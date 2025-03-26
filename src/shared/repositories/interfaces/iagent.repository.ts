// src/shared/repositories/interfaces/iagent.repository.ts
export interface IAgentRepository {
  findById(id: string): Promise<Agent.Config | null>;
  create(agent: Agent.Config): Promise<Agent.Config>;
  update(id: string, agent: Partial<Agent.Config>): Promise<Agent.Config>;
  delete(id: string): Promise<void>;
  findAll(filters?: Record<string, any>): Promise<Agent.Config[]>;
}
