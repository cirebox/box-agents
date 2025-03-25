/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ToolDto {
  @ApiProperty({
    description: 'Nome da ferramenta',
    example: 'calculator',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição da ferramenta',
    example: 'Uma ferramenta para realizar cálculos matemáticos',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Função de callback para a ferramenta',
    example: 'function() { return "resultado"; }',
  })
  callback?: Function;
}

export class CreateAgentDto {
  @ApiProperty({
    description: 'Papel do agente no sistema',
    example: 'Senior Backend Developer',
  })
  role: string;

  @ApiProperty({
    description: 'Objetivo do agente',
    example: 'Desenvolver APIs eficientes e seguras',
  })
  goal: string;

  @ApiProperty({
    description: 'História de fundo do agente',
    example:
      'Desenvolvedor com 10 anos de experiência em arquitetura de sistemas',
  })
  backstory: string;

  @ApiPropertyOptional({
    description: 'Ferramentas disponíveis para o agente',
    type: [ToolDto],
  })
  tools?: ToolDto[];

  @ApiPropertyOptional({
    description: 'Se o agente pode delegar tarefas',
    default: false,
  })
  allowDelegation?: boolean;

  @ApiPropertyOptional({
    description: 'Nome do modelo de IA a ser usado',
    example: 'gpt-4',
    default: 'gpt-4',
  })
  modelName?: string;
}
