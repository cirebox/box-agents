// src/shared/repositories/interfaces/iagent.repository.ts
export interface IAgentRepository {
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<any>;
  findAll(filters?: Record<string, any>): Promise<any[]>;
}
