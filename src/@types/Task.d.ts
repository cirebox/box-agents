// src/@types/Task.d.ts
declare namespace Task {
  interface Config {
    id: string;
    description: string;
    expectedOutput?: string;
    context?: Record<string, any>;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    deadline?: Date;
    assignedAgentId?: string;
    assignedCrewId?: string;
    dependencies?: string[]; // IDs de tarefas que precisam ser concluídas antes
    tags?: string[];
    templateId?: string; // Referência para um template de prompt
  }

  interface Execution {
    id: string;
    taskId: string;
    agentId: string;
    crewId?: string;
    input: Record<string, any>;
    output?: string;
    status: ExecutionStatus;
    startedAt: Date;
    finishedAt?: Date;
    executionTime?: number; // em milissegundos
    metrics?: ExecutionMetrics;
    error?: string;
    attempts: number;
    logs: ExecutionLog[];
  }

  interface ExecutionMetrics {
    tokenCount?: number;
    promptTokens?: number;
    completionTokens?: number;
    totalCost?: number;
    latency?: number;
  }

  interface ExecutionLog {
    timestamp: Date;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
    metadata?: Record<string, any>;
  }

  type ExecutionStatus =
    | 'pending' // Aguardando execução
    | 'in-progress' // Em execução
    | 'completed' // Concluída com sucesso
    | 'failed' // Falhou na execução
    | 'cancelled' // Cancelada manualmente
    | 'waiting' // Aguardando dependências
    | 'retrying'; // Em processo de retry

  interface Template {
    id: string;
    name: string;
    description: string;
    promptTemplate: string;
    defaultModelName?: string;
    parameters: TemplateParameter[];
    category: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  interface TemplateParameter {
    name: string;
    description: string;
    required: boolean;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    defaultValue?: any;
  }

  interface Result {
    taskId: string;
    executionId: string;
    output: string;
    success: boolean;
    executionTime: number;
    metadata?: Record<string, any>;
  }
}
