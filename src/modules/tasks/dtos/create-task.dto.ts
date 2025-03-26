// src/modules/tasks/dtos/create-task.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsEnum,
  IsISO8601,
  IsUUID,
} from 'class-validator';

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class CreateTaskDto {
  @ApiProperty({
    description: 'Descrição detalhada da tarefa',
    example: 'Desenvolver um controller NestJS para gerenciamento de usuários',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Formato ou conteúdo esperado como resultado da tarefa',
    example: 'Um controller completo com endpoints CRUD para usuários',
  })
  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @ApiPropertyOptional({
    description: 'Informações contextuais adicionais para execução da tarefa',
    example: { database: 'PostgreSQL', entities: ['User', 'Profile'] },
  })
  @IsObject()
  @IsOptional()
  context?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Prioridade da tarefa',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Data limite para conclusão da tarefa (ISO 8601)',
    example: '2025-04-15T14:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  deadline?: Date;

  @ApiPropertyOptional({
    description: 'ID do agente designado para esta tarefa',
    example: 'agent-1616161616161',
  })
  @IsUUID()
  @IsOptional()
  assignedAgentId?: string;

  @ApiPropertyOptional({
    description: 'ID da equipe (crew) designada para esta tarefa',
    example: 'crew-1616161616161',
  })
  @IsUUID()
  @IsOptional()
  assignedCrewId?: string;

  @ApiPropertyOptional({
    description: 'IDs de tarefas que precisam ser concluídas antes desta',
    type: [String],
    example: ['task-1', 'task-2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependencies?: string[];

  @ApiPropertyOptional({
    description: 'Tags para categorização da tarefa',
    type: [String],
    example: ['backend', 'controller', 'crud'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'ID do template que esta tarefa deve usar',
    example: 'template-1616161616161',
  })
  @IsString()
  @IsOptional()
  templateId?: string;
}
