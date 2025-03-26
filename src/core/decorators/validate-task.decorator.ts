// src/core/decorators/validate-task.decorator.ts
import { BadRequestException } from '@nestjs/common';

/**
 * Decorador para validar se um objeto é uma tarefa válida antes de executar o método
 * @param validateFn Função customizada de validação (opcional)
 */
export function ValidateTask(validateFn?: (task: any) => boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Assumimos que o primeiro argumento é a tarefa a ser validada
      const task = args[0];

      // Validação básica de campos obrigatórios
      if (!task) {
        throw new BadRequestException('Tarefa não fornecida');
      }

      if (!task.id) {
        throw new BadRequestException('O ID da tarefa é obrigatório');
      }

      if (!task.description) {
        throw new BadRequestException('A descrição da tarefa é obrigatória');
      }

      // Validar prioridade se fornecida
      if (
        task.priority &&
        !['low', 'medium', 'high', 'critical'].includes(task.priority)
      ) {
        throw new BadRequestException(
          'Prioridade inválida. Valores permitidos: low, medium, high, critical',
        );
      }

      // Validar deadline se fornecida
      if (
        task.deadline &&
        !(task.deadline instanceof Date) &&
        isNaN(new Date(task.deadline).getTime())
      ) {
        throw new BadRequestException(
          'Deadline inválida. Deve ser uma data válida.',
        );
      }

      // Se agentId e crewId forem fornecidos simultaneamente, verificar se isso é permitido
      if (task.assignedAgentId && task.assignedCrewId) {
        // Este é um exemplo - você pode ajustar a regra conforme necessário
        throw new BadRequestException(
          'Uma tarefa não pode ser atribuída a um agente e a uma equipe simultaneamente',
        );
      }

      // Se uma função de validação personalizada foi fornecida, execute-a
      if (validateFn && !validateFn(task)) {
        throw new BadRequestException(
          'A tarefa falhou na validação personalizada',
        );
      }

      // Se todas as validações passarem, execute o método original
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Decorador para validar se um objeto de execução de tarefa é válido antes de executar o método
 * @param validateFn Função customizada de validação (opcional)
 */
export function ValidateTaskExecution(
  validateFn?: (execution: any) => boolean,
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Assumimos que o primeiro argumento é a execução a ser validada
      const execution = args[0];

      // Validação básica de campos obrigatórios
      if (!execution) {
        throw new BadRequestException('Execução não fornecida');
      }

      if (!execution.id) {
        throw new BadRequestException('O ID da execução é obrigatório');
      }

      if (!execution.taskId) {
        throw new BadRequestException('O ID da tarefa é obrigatório');
      }

      if (!execution.agentId) {
        throw new BadRequestException('O ID do agente é obrigatório');
      }

      // Validar status se fornecido
      if (
        execution.status &&
        ![
          'pending',
          'in-progress',
          'completed',
          'failed',
          'cancelled',
          'waiting',
          'retrying',
        ].includes(execution.status)
      ) {
        throw new BadRequestException(
          'Status inválido. Valores permitidos: pending, in-progress, completed, failed, cancelled, waiting, retrying',
        );
      }

      // Validar datas
      if (
        execution.startedAt &&
        !(execution.startedAt instanceof Date) &&
        isNaN(new Date(execution.startedAt).getTime())
      ) {
        throw new BadRequestException(
          'Data de início inválida. Deve ser uma data válida.',
        );
      }

      if (
        execution.finishedAt &&
        !(execution.finishedAt instanceof Date) &&
        isNaN(new Date(execution.finishedAt).getTime())
      ) {
        throw new BadRequestException(
          'Data de finalização inválida. Deve ser uma data válida.',
        );
      }

      // Verificar se a data de finalização é posterior à data de início
      if (execution.startedAt && execution.finishedAt) {
        const startDate = new Date(execution.startedAt);
        const endDate = new Date(execution.finishedAt);

        if (endDate < startDate) {
          throw new BadRequestException(
            'A data de finalização deve ser posterior à data de início',
          );
        }
      }

      // Se uma função de validação personalizada foi fornecida, execute-a
      if (validateFn && !validateFn(execution)) {
        throw new BadRequestException(
          'A execução falhou na validação personalizada',
        );
      }

      // Se todas as validações passarem, execute o método original
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Decorador para validar se um objeto de template de tarefa é válido antes de executar o método
 * @param validateFn Função customizada de validação (opcional)
 */
export function ValidateTaskTemplate(validateFn?: (template: any) => boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Assumimos que o primeiro argumento é o template a ser validado
      const template = args[0];

      // Validação básica de campos obrigatórios
      if (!template) {
        throw new BadRequestException('Template não fornecido');
      }

      if (!template.id) {
        throw new BadRequestException('O ID do template é obrigatório');
      }

      if (!template.name) {
        throw new BadRequestException('O nome do template é obrigatório');
      }

      if (!template.description) {
        throw new BadRequestException('A descrição do template é obrigatória');
      }

      if (!template.promptTemplate) {
        throw new BadRequestException(
          'O conteúdo do template (promptTemplate) é obrigatório',
        );
      }

      if (!template.category) {
        throw new BadRequestException('A categoria do template é obrigatória');
      }

      // Validar parameters se fornecido
      if (template.parameters) {
        if (!Array.isArray(template.parameters)) {
          throw new BadRequestException('O campo parameters deve ser um array');
        }

        // Validar cada parâmetro
        for (const param of template.parameters) {
          if (!param.name) {
            throw new BadRequestException(
              'Todos os parâmetros devem ter um nome',
            );
          }

          if (!param.type) {
            throw new BadRequestException(
              'Todos os parâmetros devem ter um tipo',
            );
          }

          if (
            !['string', 'number', 'boolean', 'array', 'object'].includes(
              param.type,
            )
          ) {
            throw new BadRequestException(
              'Tipo de parâmetro inválido. Valores permitidos: string, number, boolean, array, object',
            );
          }
        }
      }

      // Se uma função de validação personalizada foi fornecida, execute-a
      if (validateFn && !validateFn(template)) {
        throw new BadRequestException(
          'O template falhou na validação personalizada',
        );
      }

      // Se todas as validações passarem, execute o método original
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
