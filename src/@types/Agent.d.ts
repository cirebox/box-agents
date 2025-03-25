// src/@types/Agent.d.ts
declare namespace Agent {
  interface Config {
    id: string;
    role: string;
    goal: string;
    backstory: string;
    tools?: Tool[];
    allowDelegation?: boolean;
    verbose?: boolean;
  }

  interface Tool {
    name: string;
    description: string;
    callback: function;
  }

  interface Task {
    id?: string;
    description: string;
    expectedOutput?: string;
    context?: Record<string, any>;
  }

  interface CrewConfig {
    agents: Agent.Config[];
    tasks: Agent.Task[];
    verbose?: boolean;
  }

  interface ExecutionResult {
    taskId: string;
    agentId: string;
    output: string;
    success: boolean;
    executionTime: number;
    metadata?: Record<string, any>;
  }
}
