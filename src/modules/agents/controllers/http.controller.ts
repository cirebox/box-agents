// src/modules/agents/controllers/http.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AgentManagerService } from '../services/agent-manager.service';
import { AgentExecutorService } from '../services/agent-executor.service';
import { CreateAgentDto } from '../dtos/create-agent.dto';
import { RunAgentDto } from '../dtos/run-agent.dto';
import { CreateCrewDto } from '../dtos/create-crew.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

@ApiTags('agents')
@Controller('agents')
export class AgentsController {
  private readonly logger = new Logger(AgentsController.name);

  constructor(
    private agentManagerService: AgentManagerService,
    private agentExecutorService: AgentExecutorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new agent' })
  @ApiCreatedResponse({
    description: 'Agent created successfully',
    schema: {
      properties: {
        agentId: { type: 'string', example: 'agent-1616161616161' },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to create agent' })
  @ApiBody({ type: CreateAgentDto })
  async createAgent(@Body() createAgentDto: CreateAgentDto) {
    try {
      // Converter as tools do DTO para o formato esperado pela interface
      const tools = createAgentDto.tools?.map((tool) => ({
        name: tool.name,
        description: tool.description,
        callback:
          tool.callback || (() => Promise.resolve('No callback provided')),
      }));

      const agentId = await this.agentManagerService.createAgent({
        id: `agent-${Date.now()}`,
        role: createAgentDto.role,
        goal: createAgentDto.goal,
        backstory: createAgentDto.backstory,
        tools,
        allowDelegation: createAgentDto.allowDelegation,
        modelName: createAgentDto.modelName,
      } as any); // Usando 'as any' para contornar a verificação de tipo

      return { agentId };
    } catch (error) {
      this.logger.error(`Error creating agent: ${error.message}`);
      throw new HttpException(
        'Failed to create agent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('run')
  @ApiOperation({ summary: 'Run an agent with a prompt' })
  @ApiResponse({
    status: 200,
    description: 'Agent executed successfully',
    schema: {
      properties: {
        response: { type: 'string', example: 'Agent response to the prompt' },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to run agent' })
  @ApiBody({ type: RunAgentDto })
  async runAgent(@Body() runAgentDto: RunAgentDto) {
    try {
      const agent = await this.agentManagerService.getAgent(
        runAgentDto.agentId,
      );
      const response = await agent.generateResponse(runAgentDto.prompt);
      return { response };
    } catch (error) {
      this.logger.error(`Error running agent: ${error.message}`);
      throw new HttpException(
        'Failed to run agent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('crews')
  @ApiOperation({ summary: 'Create a new crew' })
  @ApiCreatedResponse({
    description: 'Crew created successfully',
    schema: {
      properties: {
        crewId: { type: 'string', example: 'crew-1616161616161' },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to create crew' })
  @ApiBody({ type: CreateCrewDto })
  async createCrew(@Body() createCrewDto: CreateCrewDto) {
    try {
      // Converter agentes e tools para o formato esperado
      const agentsWithIds = createCrewDto.agents.map((agent) => {
        const tools = agent.tools?.map((tool) => ({
          name: tool.name,
          description: tool.description,
          callback:
            tool.callback || (() => Promise.resolve('No callback provided')),
        }));

        return {
          id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: agent.role,
          goal: agent.goal,
          backstory: agent.backstory,
          tools,
          allowDelegation: agent.allowDelegation,
          modelName: agent.modelName,
        };
      });

      const crewId = await this.agentManagerService.createCrew({
        agents: agentsWithIds as any, // Usando 'as any' para contornar a verificação de tipo
        tasks: createCrewDto.tasks,
        verbose: createCrewDto.verbose,
      });

      return { crewId };
    } catch (error) {
      this.logger.error(`Error creating crew: ${error.message}`);
      throw new HttpException(
        'Failed to create crew',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('crews/:crewId/tasks/:taskId')
  @ApiOperation({ summary: 'Execute a task with a crew' })
  @ApiResponse({
    status: 200,
    description: 'Task executed successfully',
    schema: {
      type: 'object',
      example: { result: 'Task execution result' },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to execute task' })
  @ApiParam({ name: 'crewId', type: 'string', description: 'Crew ID' })
  @ApiParam({ name: 'taskId', type: 'string', description: 'Task ID' })
  @ApiBody({
    schema: {
      type: 'object',
      example: { key1: 'value1', key2: 'value2' },
      description: 'Input parameters for the task',
    },
  })
  async executeTask(
    @Param('crewId') crewId: string,
    @Param('taskId') taskId: string,
    @Body() input: Record<string, any>,
  ) {
    try {
      const result = await this.agentExecutorService.executeTask(
        crewId,
        taskId,
        input,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error executing task: ${error.message}`);
      throw new HttpException(
        'Failed to execute task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('backend-task')
  @ApiOperation({ summary: 'Execute a backend development task' })
  @ApiResponse({
    status: 200,
    description: 'Backend task executed successfully',
    schema: {
      properties: {
        result: {
          type: 'object',
          example: {
            code: 'Generated code for backend implementation',
            documentation: 'Documentation for the implementation',
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to execute backend task',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['resource', 'endpoints', 'methods'],
      properties: {
        resource: { type: 'string', example: 'users' },
        endpoints: {
          type: 'array',
          items: { type: 'string' },
          example: ['/users', '/users/:id'],
        },
        methods: {
          type: 'array',
          items: { type: 'string' },
          example: ['GET', 'POST', 'PUT', 'DELETE'],
        },
      },
    },
  })
  async executeBackendTask(
    @Body() input: { resource: string; endpoints: string[]; methods: string[] },
  ) {
    try {
      const result = await this.agentExecutorService.executeBackendTask(input);
      return { result };
    } catch (error) {
      this.logger.error(`Error executing backend task: ${error.message}`);
      throw new HttpException(
        'Failed to execute backend task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('fullstack-task')
  @ApiOperation({ summary: 'Execute a full-stack development task' })
  @ApiResponse({
    status: 200,
    description: 'Full-stack task executed successfully',
    schema: {
      properties: {
        result: {
          type: 'object',
          example: {
            backend: 'Generated code for backend',
            frontend: 'Generated code for frontend components',
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to execute full-stack task',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['feature', 'endpoints', 'components'],
      properties: {
        feature: { type: 'string', example: 'User Authentication' },
        endpoints: {
          type: 'array',
          items: { type: 'string' },
          example: ['/auth/login', '/auth/register'],
        },
        components: {
          type: 'array',
          items: { type: 'string' },
          example: ['LoginForm', 'RegistrationForm'],
        },
      },
    },
  })
  async executeFullStackTask(
    @Body()
    input: {
      feature: string;
      endpoints: string[];
      components: string[];
    },
  ) {
    try {
      const result =
        await this.agentExecutorService.executeFullStackTask(input);
      return { result };
    } catch (error) {
      this.logger.error(`Error executing full-stack task: ${error.message}`);
      throw new HttpException(
        'Failed to execute full-stack task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
