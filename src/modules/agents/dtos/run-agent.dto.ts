import { ApiProperty } from '@nestjs/swagger';

export class RunAgentDto {
  @ApiProperty({
    description: 'ID do agente a ser executado',
    example: 'agent-1616161616161',
  })
  agentId: string;

  @ApiProperty({
    description: 'Prompt para o agente',
    example: 'Desenvolva uma API REST para gerenciar usuários',
  })
  prompt: string;
}
