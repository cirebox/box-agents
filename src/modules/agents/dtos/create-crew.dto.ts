import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto';

export class TaskDto {
  @ApiProperty({
    description: 'Descrição da tarefa',
    example: 'Desenvolver um sistema de autenticação',
  })
  description: string;

  @ApiProperty({
    description: 'ID do agente responsável pela tarefa',
    example: 'agent-1616161616161',
  })
  agentId?: string;

  @ApiPropertyOptional({
    description: 'Resultados esperados da tarefa',
    example: 'Código de autenticação com JWT',
  })
  expectedOutput?: string;
}

export class CreateCrewDto {
  @ApiProperty({
    description: 'Lista de agentes para a equipe',
    type: [CreateAgentDto],
  })
  agents: CreateAgentDto[];

  @ApiProperty({
    description: 'Lista de tarefas a serem executadas pela equipe',
    type: [TaskDto],
  })
  tasks: TaskDto[];

  @ApiPropertyOptional({
    description: 'Modo verboso para logs detalhados',
    default: false,
  })
  verbose?: boolean;
}
