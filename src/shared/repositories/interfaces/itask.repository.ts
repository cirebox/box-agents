// src/shared/repositories/interfaces/itask.repository.ts
export interface ITaskRepository {
  /**
   * Cria uma nova tarefa no repositório
   */
  create(data: Task.Config): Promise<Task.Config>;

  /**
   * Atualiza uma tarefa existente
   */
  update(id: string, data: Partial<Task.Config>): Promise<Task.Config>;

  /**
   * Remove uma tarefa
   */
  delete(id: string): Promise<void>;

  /**
   * Busca uma tarefa pelo ID
   */
  findById(id: string): Promise<Task.Config | null>;

  /**
   * Busca tarefas com base em filtros
   */
  findAll(filters?: Record<string, any>): Promise<Task.Config[]>;

  /**
   * Salva uma execução de tarefa
   */
  saveExecution(execution: Task.Execution): Promise<Task.Execution>;

  /**
   * Busca uma execução pelo ID
   */
  findExecutionById(id: string): Promise<Task.Execution | null>;

  /**
   * Busca execuções de uma tarefa específica
   */
  findExecutions(taskId: string): Promise<Task.Execution[]>;

  /**
   * Busca execuções com base em filtros
   */
  findAllExecutions(filters?: Record<string, any>): Promise<Task.Execution[]>;

  /**
   * Salva um template de tarefa
   */
  saveTemplate(template: Task.Template): Promise<Task.Template>;

  /**
   * Busca um template pelo ID
   */
  findTemplateById(id: string): Promise<Task.Template | null>;

  /**
   * Busca templates com base em filtros
   */
  findAllTemplates(filters?: Record<string, any>): Promise<Task.Template[]>;
}
