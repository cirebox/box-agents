// src/modules/tasks/controllers/http.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TaskManagerService } from '../services/task-manager.service';
import { TaskExecutorService } from '../services/task-executor.service';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { ExecuteTaskDto } from '../dtos/execute-task.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(
    private taskManagerService: TaskManagerService,
    private taskExecutorService: TaskExecutorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiCreatedResponse({
    description: 'Task created successfully',
    schema: {
      properties: {
        taskId: { type: 'string', example: 'task-1616161616161' },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to create task' })
  @ApiBody({ type: CreateTaskDto })
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    try {
      const taskId = await this.taskManagerService.createTask({
        id: `task-${Date.now()}`,
        description: createTaskDto.description,
        expectedOutput: createTaskDto.expectedOutput,
        context: createTaskDto.context,
        priority: createTaskDto.priority,
        deadline: createTaskDto.deadline,
        assignedAgentId: createTaskDto.assignedAgentId,
        assignedCrewId: createTaskDto.assignedCrewId,
        dependencies: createTaskDto.dependencies,
        tags: createTaskDto.tags,
        templateId: createTaskDto.templateId,
      });

      return { taskId };
    } catch (error) {
      this.logger.error(`Error creating task: ${error.message}`);
      throw new HttpException(
        'Failed to create task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks or filter by criteria' })
  @ApiOkResponse({
    description: 'Tasks retrieved successfully',
    isArray: true,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'pending',
      'in-progress',
      'completed',
      'failed',
      'cancelled',
      'waiting',
      'retrying',
    ],
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @ApiQuery({ name: 'agentId', required: false })
  @ApiQuery({ name: 'crewId', required: false })
  @ApiInternalServerErrorResponse({ description: 'Failed to retrieve tasks' })
  async getTasks(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('agentId') agentId?: string,
    @Query('crewId') crewId?: string,
  ) {
    try {
      const filters: Record<string, any> = {};

      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (agentId) filters.assignedAgentId = agentId;
      if (crewId) filters.assignedCrewId = crewId;

      const tasks = await this.taskManagerService.findTasks(filters);
      return tasks;
    } catch (error) {
      this.logger.error(`Error retrieving tasks: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve tasks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiOkResponse({
    description: 'Task retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiInternalServerErrorResponse({ description: 'Failed to retrieve task' })
  async getTask(@Param('id') id: string) {
    try {
      const task = await this.taskManagerService.getTask(id);

      if (!task) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      return task;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }

      this.logger.error(`Error retrieving task: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiOkResponse({
    description: 'Task updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiInternalServerErrorResponse({ description: 'Failed to update task' })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    try {
      await this.taskManagerService.updateTask(id, updateTaskDto);
      return { message: 'Task updated successfully' };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      this.logger.error(`Error updating task: ${error.message}`);
      throw new HttpException(
        'Failed to update task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiOkResponse({
    description: 'Task deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiInternalServerErrorResponse({ description: 'Failed to delete task' })
  async deleteTask(@Param('id') id: string) {
    try {
      await this.taskManagerService.deleteTask(id);
      return { message: 'Task deleted successfully' };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      this.logger.error(`Error deleting task: ${error.message}`);
      throw new HttpException(
        'Failed to delete task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute a task' })
  @ApiOkResponse({
    description: 'Task executed successfully',
    schema: {
      properties: {
        executionId: { type: 'string', example: 'exec-1616161616161' },
        result: { type: 'object' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: ExecuteTaskDto })
  @ApiInternalServerErrorResponse({ description: 'Failed to execute task' })
  async executeTask(
    @Param('id') id: string,
    @Body() executeTaskDto: ExecuteTaskDto,
  ) {
    try {
      const result = await this.taskExecutorService.execute({
        taskId: id,
        agentId: executeTaskDto.agentId,
        crewId: executeTaskDto.crewId,
        input: executeTaskDto.input || {},
      });

      return result;
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      this.logger.error(`Error executing task: ${error.message}`);
      throw new HttpException(
        'Failed to execute task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/executions')
  @ApiOperation({ summary: 'Get all executions of a task' })
  @ApiOkResponse({
    description: 'Task executions retrieved successfully',
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve task executions',
  })
  async getTaskExecutions(@Param('id') id: string) {
    try {
      const executions = await this.taskManagerService.getTaskExecutions(id);
      return executions;
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      this.logger.error(`Error retrieving task executions: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve task executions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('executions/:id')
  @ApiOperation({ summary: 'Get a specific task execution by ID' })
  @ApiOkResponse({
    description: 'Task execution retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Execution not found' })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve execution',
  })
  async getExecution(@Param('id') id: string) {
    try {
      const execution = await this.taskManagerService.getExecution(id);

      if (!execution) {
        throw new HttpException('Execution not found', HttpStatus.NOT_FOUND);
      }

      return execution;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }

      this.logger.error(`Error retrieving execution: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve execution',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('executions/:id/cancel')
  @ApiOperation({ summary: 'Cancel a task execution' })
  @ApiOkResponse({
    description: 'Execution cancelled successfully',
  })
  @ApiNotFoundResponse({ description: 'Execution not found' })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiInternalServerErrorResponse({ description: 'Failed to cancel execution' })
  async cancelExecution(@Param('id') id: string) {
    try {
      await this.taskExecutorService.cancelExecution(id);
      return { message: 'Execution cancelled successfully' };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException('Execution not found', HttpStatus.NOT_FOUND);
      }

      this.logger.error(`Error cancelling execution: ${error.message}`);
      throw new HttpException(
        'Failed to cancel execution',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('executions/:id/retry')
  @ApiOperation({ summary: 'Retry a failed task execution' })
  @ApiOkResponse({
    description: 'Execution retry initiated successfully',
    schema: {
      properties: {
        executionId: { type: 'string', example: 'exec-1616161616161' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Execution not found' })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiInternalServerErrorResponse({ description: 'Failed to retry execution' })
  async retryExecution(@Param('id') id: string) {
    try {
      const newExecutionId = await this.taskExecutorService.retryExecution(id);
      return { executionId: newExecutionId };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException('Execution not found', HttpStatus.NOT_FOUND);
      }

      this.logger.error(`Error retrying execution: ${error.message}`);
      throw new HttpException(
        'Failed to retry execution',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create a new task template' })
  @ApiCreatedResponse({
    description: 'Template created successfully',
    schema: {
      properties: {
        templateId: { type: 'string', example: 'template-1616161616161' },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to create template' })
  async createTemplate(@Body() createTemplateDto: any) {
    try {
      const templateId =
        await this.taskManagerService.createTemplate(createTemplateDto);
      return { templateId };
    } catch (error) {
      this.logger.error(`Error creating template: ${error.message}`);
      throw new HttpException(
        'Failed to create template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all task templates' })
  @ApiOkResponse({
    description: 'Templates retrieved successfully',
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve templates',
  })
  async getTemplates() {
    try {
      const templates = await this.taskManagerService.getTemplates();
      return templates;
    } catch (error) {
      this.logger.error(`Error retrieving templates: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve templates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a template by ID' })
  @ApiOkResponse({
    description: 'Template retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Template not found' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve template',
  })
  async getTemplate(@Param('id') id: string) {
    try {
      const template = await this.taskManagerService.getTemplate(id);

      if (!template) {
        throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
      }

      return template;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }

      this.logger.error(`Error retrieving template: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('batch')
  @ApiOperation({ summary: 'Create multiple tasks in batch' })
  @ApiCreatedResponse({
    description: 'Tasks created successfully',
    schema: {
      properties: {
        taskIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['task-1', 'task-2'],
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to create tasks' })
  async createBatchTasks(@Body() createTasksDto: { tasks: CreateTaskDto[] }) {
    try {
      const taskIds = await this.taskManagerService.createBatchTasks(
        createTasksDto.tasks,
      );
      return { taskIds };
    } catch (error) {
      this.logger.error(`Error creating batch tasks: ${error.message}`);
      throw new HttpException(
        'Failed to create batch tasks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze task complexity and requirements' })
  @ApiOkResponse({
    description: 'Task analysis completed successfully',
    schema: {
      properties: {
        analysis: { type: 'object' },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to analyze task' })
  async analyzeTask(
    @Body()
    taskDescription: {
      description: string;
      context?: Record<string, any>;
    },
  ) {
    try {
      const analysis = await this.taskManagerService.analyzeTask(
        taskDescription.description,
        taskDescription.context,
      );
      return { analysis };
    } catch (error) {
      this.logger.error(`Error analyzing task: ${error.message}`);
      throw new HttpException(
        'Failed to analyze task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
