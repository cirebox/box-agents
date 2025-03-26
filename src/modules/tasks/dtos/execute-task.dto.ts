// src/modules/tasks/dtos/execute-task.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class ExecuteTaskDto {
  @ApiProperty({
    description: 'ID do agente que executará a tarefa',
    example: 'agent-1616161616161',
  })
  @IsUUID()
  @ValidateIf((o) => !o.crewId)
  agentId: string;

  @ApiPropertyOptional({
    description: 'ID da equipe (crew) que executará a tarefa',
    example: 'crew-1616161616161',
  })
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.agentId)
  crewId?: string;

  @ApiPropertyOptional({
    description: 'Parâmetros de entrada para a execução da tarefa',
    example: {
      resourceName: 'User',
      includeAuthentication: true,
      fields: ['id', 'name', 'email'],
    },
  })
  @IsObject()
  @IsOptional()
  input?: Record<string, any>;

  @ApiPropertyOptional({
    description:
      'Nome do modelo de IA a ser usado (sobrescreve configuração padrão)',
    example: 'gpt-4',
  })
  @IsString()
  @IsOptional()
  modelName?: string;

  @ApiPropertyOptional({
    description: 'Temperatura para geração de resposta (0.0 - 1.0)',
    example: 0.7,
  })
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({
    description: 'ID da sessão para manter contexto entre execuções',
    example: 'session-1616161616161',
  })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Se deve salvar o histórico desta execução',
    example: true,
    default: true,
  })
  @IsOptional()
  saveHistory?: boolean;
}
