// src/shared/repositories/interfaces/itask.repository.ts
export interface ITaskRepository {
  /**
   * Cria uma nova tarefa no repositório
   * @param data Dados da tarefa a ser criada
   * @returns A tarefa criada
   */
  create(data: Task.Config): Promise<Task.Config>;

  /**
   * Atualiza uma tarefa existente
   * @param id ID da tarefa a ser atualizada
   * @param data Dados para atualização
   * @returns A tarefa atualizada
   */
  update(id: string, data: Partial<Task.Config>): Promise<Task.Config>;

  /**
   * Remove uma tarefa
   * @param id ID da tarefa a ser removida
   */
  delete(id: string): Promise<void>;

  /**
   * Busca uma tarefa pelo ID
   * @param id ID da tarefa
   * @returns A tarefa encontrada ou null
   */
  findById(id: string): Promise<Task.Config | null>;

  /**
   * Busca tarefas com base em filtros
   * @param filters Filtros opcionais
   * @returns Lista de tarefas
   */
  findAll(filters?: Record<string, any>): Promise<Task.Config[]>;

  /**
   * Salva uma execução de tarefa
   * @param execution Dados da execução
   * @returns A execução salva
   */
  saveExecution(execution: Task.Execution): Promise<Task.Execution>;

  /**
   * Busca uma execução pelo ID
   * @param id ID da execução
   * @returns A execução encontrada ou null
   */
  findExecutionById(id: string): Promise<Task.Execution | null>;

  /**
   * Busca execuções de uma tarefa específica
   * @param taskId ID da tarefa
   * @returns Lista de execuções
   */
  findExecutions(taskId: string): Promise<Task.Execution[]>;

  /**
   * Busca execuções com base em filtros
   * @param filters Filtros opcionais
   * @returns Lista de execuções
   */
  findAllExecutions(filters?: Record<string, any>): Promise<Task.Execution[]>;

  /**
   * Salva um template de tarefa
   * @param template Dados do template
   * @returns O template salvo
   */
  saveTemplate(template: Task.Template): Promise<Task.Template>;

  /**
   * Busca um template pelo ID
   * @param id ID do template
   * @returns O template encontrado ou null
   */
  findTemplateById(id: string): Promise<Task.Template | null>;

  /**
   * Busca templates com base em filtros
   * @param filters Filtros opcionais
   * @returns Lista de templates
   */
  findAllTemplates(filters?: Record<string, any>): Promise<Task.Template[]>;
}
