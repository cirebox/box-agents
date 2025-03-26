// src/modules/tasks/dtos/update-task.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsEnum,
  IsISO8601,
  IsUUID,
  IsBoolean,
} from 'class-validator';

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Descrição atualizada da tarefa',
    example: 'Desenvolver um controller NestJS para gerenciamento de usuários',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Formato ou conteúdo esperado atualizado',
    example: 'Um controller completo com endpoints CRUD para usuários',
  })
  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @ApiPropertyOptional({
    description: 'Informações contextuais atualizadas',
    example: { database: 'PostgreSQL', entities: ['User', 'Profile'] },
  })
  @IsObject()
  @IsOptional()
  context?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Prioridade atualizada da tarefa',
    enum: TaskPriority,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Data limite atualizada (ISO 8601)',
    example: '2025-04-15T14:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  deadline?: Date;

  @ApiPropertyOptional({
    description: 'ID do agente designado (atualizado)',
    example: 'agent-1616161616161',
  })
  @IsUUID()
  @IsOptional()
  assignedAgentId?: string;

  @ApiPropertyOptional({
    description: 'ID da equipe designada (atualizada)',
    example: 'crew-1616161616161',
  })
  @IsUUID()
  @IsOptional()
  assignedCrewId?: string;

  @ApiPropertyOptional({
    description: 'IDs de tarefas dependentes (atualizados)',
    type: [String],
    example: ['task-1', 'task-2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependencies?: string[];

  @ApiPropertyOptional({
    description: 'Tags atualizadas',
    type: [String],
    example: ['backend', 'controller', 'crud'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'ID do template (atualizado)',
    example: 'template-1616161616161',
  })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Indicador se a tarefa está ativa',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
