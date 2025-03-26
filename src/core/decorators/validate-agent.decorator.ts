// src/core/decorators/validate-agent.decorator.ts
import { BadRequestException } from '@nestjs/common';

/**
 * Decorador para validar se um objeto é um agente válido antes de executar o método
 * @param validateFn Função customizada de validação (opcional)
 */
export function ValidateAgent(validateFn?: (agent: any) => boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Assumimos que o primeiro argumento é o agente a ser validado
      const agent = args[0];

      // Validação básica de campos obrigatórios
      if (!agent) {
        throw new BadRequestException('Agente não fornecido');
      }

      if (!agent.id) {
        throw new BadRequestException('O ID do agente é obrigatório');
      }

      if (!agent.role) {
        throw new BadRequestException('O papel (role) do agente é obrigatório');
      }

      if (!agent.goal) {
        throw new BadRequestException(
          'O objetivo (goal) do agente é obrigatório',
        );
      }

      if (!agent.backstory) {
        throw new BadRequestException(
          'A história de fundo (backstory) do agente é obrigatória',
        );
      }

      // Se uma função de validação personalizada foi fornecida, execute-a
      if (validateFn && !validateFn(agent)) {
        throw new BadRequestException(
          'O agente falhou na validação personalizada',
        );
      }

      // Se todas as validações passarem, execute o método original
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Decorador para validar se um array de agentes é válido antes de executar o método
 * @param validateFn Função customizada de validação (opcional)
 */
export function ValidateAgents(validateFn?: (agents: any[]) => boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Assumimos que o primeiro argumento é o array de agentes a ser validado
      const agents = args[0];

      // Validação básica
      if (!agents || !Array.isArray(agents)) {
        throw new BadRequestException(
          'Lista de agentes inválida ou não fornecida',
        );
      }

      if (agents.length === 0) {
        throw new BadRequestException(
          'A lista de agentes não pode estar vazia',
        );
      }

      // Validar cada agente individualmente
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];

        if (!agent) {
          throw new BadRequestException(`Agente na posição ${i} é inválido`);
        }

        if (!agent.id) {
          throw new BadRequestException(`Agente na posição ${i} não possui ID`);
        }

        if (!agent.role) {
          throw new BadRequestException(
            `Agente na posição ${i} não possui papel (role)`,
          );
        }

        if (!agent.goal) {
          throw new BadRequestException(
            `Agente na posição ${i} não possui objetivo (goal)`,
          );
        }

        if (!agent.backstory) {
          throw new BadRequestException(
            `Agente na posição ${i} não possui história de fundo (backstory)`,
          );
        }
      }

      // Se uma função de validação personalizada foi fornecida, execute-a
      if (validateFn && !validateFn(agents)) {
        throw new BadRequestException(
          'Os agentes falharam na validação personalizada',
        );
      }

      // Se todas as validações passarem, execute o método original
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Decorador para validar se uma configuração de equipe (crew) é válida antes de executar o método
 */
export function ValidateCrew() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Assumimos que o primeiro argumento é a configuração da equipe
      const crewConfig = args[0];

      // Validação básica
      if (!crewConfig) {
        throw new BadRequestException('Configuração da equipe não fornecida');
      }

      if (
        !crewConfig.agents ||
        !Array.isArray(crewConfig.agents) ||
        crewConfig.agents.length === 0
      ) {
        throw new BadRequestException('A equipe deve ter pelo menos um agente');
      }

      if (
        !crewConfig.tasks ||
        !Array.isArray(crewConfig.tasks) ||
        crewConfig.tasks.length === 0
      ) {
        throw new BadRequestException(
          'A equipe deve ter pelo menos uma tarefa',
        );
      }

      // Validar cada agente na equipe
      for (let i = 0; i < crewConfig.agents.length; i++) {
        const agent = crewConfig.agents[i];

        if (!agent) {
          throw new BadRequestException(`Agente na posição ${i} é inválido`);
        }

        if (!agent.id) {
          throw new BadRequestException(`Agente na posição ${i} não possui ID`);
        }

        if (!agent.role) {
          throw new BadRequestException(
            `Agente na posição ${i} não possui papel (role)`,
          );
        }

        if (!agent.goal) {
          throw new BadRequestException(
            `Agente na posição ${i} não possui objetivo (goal)`,
          );
        }

        if (!agent.backstory) {
          throw new BadRequestException(
            `Agente na posição ${i} não possui história de fundo (backstory)`,
          );
        }
      }

      // Validar cada tarefa na equipe
      for (let i = 0; i < crewConfig.tasks.length; i++) {
        const task = crewConfig.tasks[i];

        if (!task) {
          throw new BadRequestException(`Tarefa na posição ${i} é inválida`);
        }

        if (!task.description) {
          throw new BadRequestException(
            `Tarefa na posição ${i} não possui descrição`,
          );
        }
      }

      // Se todas as validações passarem, execute o método original
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
