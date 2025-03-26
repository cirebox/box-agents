import { Test, TestingModule } from '@nestjs/testing';
import { TrackTaskService } from '../services/track-task.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';

describe('TrackTaskService', () => {
  let service: TrackTaskService;
  let mockTaskRepository: any;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    // Configurar mocks
    mockTaskRepository = {
      findExecutionById: jest.fn(),
      findExecutions: jest.fn(),
      findById: jest.fn(),
      saveExecution: jest.fn(),
    };

    eventEmitter = new EventEmitter2();
    jest.spyOn(eventEmitter, 'on');
    jest.spyOn(eventEmitter, 'emit');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackTaskService,
        { provide: 'ITaskRepository', useValue: mockTaskRepository },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<TrackTaskService>(TrackTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should setup event listeners on initialization', () => {
    // Verificar se os listeners de eventos foram registrados
    expect(eventEmitter.on).toHaveBeenCalledWith(
      'task.execution.started',
      expect.any(Function),
    );
    expect(eventEmitter.on).toHaveBeenCalledWith(
      'task.execution.completed',
      expect.any(Function),
    );
    expect(eventEmitter.on).toHaveBeenCalledWith(
      'task.execution.failed',
      expect.any(Function),
    );
    expect(eventEmitter.on).toHaveBeenCalledWith(
      'task.execution.cancelled',
      expect.any(Function),
    );
  });

  it('should get execution by ID', async () => {
    // Arrange
    const executionId = 'exec-123';
    const mockExecution = {
      id: executionId,
      taskId: 'task-123',
      status: 'completed',
      logs: [],
    };
    mockTaskRepository.findExecutionById.mockResolvedValue(mockExecution);

    // Act
    const result = await service.getExecution(executionId);

    // Assert
    expect(result).toEqual(mockExecution);
    expect(mockTaskRepository.findExecutionById).toHaveBeenCalledWith(
      executionId,
    );
  });

  it('should throw NotFoundException when getting non-existent execution', async () => {
    // Arrange
    const executionId = 'non-existent-exec';
    mockTaskRepository.findExecutionById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.getExecution(executionId)).rejects.toThrowError(
      NotFoundException,
    );
    expect(mockTaskRepository.findExecutionById).toHaveBeenCalledWith(
      executionId,
    );
  });

  it('should get all executions for a task', async () => {
    // Arrange
    const taskId = 'task-123';
    const mockExecutions = [
      { id: 'exec-1', taskId, status: 'completed' },
      { id: 'exec-2', taskId, status: 'failed' },
    ];
    mockTaskRepository.findExecutions.mockResolvedValue(mockExecutions);

    // Act
    const result = await service.getTaskExecutions(taskId);

    // Assert
    expect(result).toEqual(mockExecutions);
    expect(result.length).toBe(2);
    expect(mockTaskRepository.findExecutions).toHaveBeenCalledWith(taskId);
  });

  it('should track execution start', async () => {
    // Arrange
    const executionId = 'exec-123';
    const mockExecution = {
      id: executionId,
      status: 'pending',
      logs: [],
    };
    mockTaskRepository.findExecutionById.mockResolvedValue(mockExecution);
    mockTaskRepository.saveExecution.mockResolvedValue(undefined);

    // Act
    await service.trackExecutionStart(executionId);

    // Assert
    expect(mockTaskRepository.findExecutionById).toHaveBeenCalledWith(
      executionId,
    );
    expect(mockTaskRepository.saveExecution).toHaveBeenCalledTimes(1);
    const savedExecution = mockTaskRepository.saveExecution.mock.calls[0][0];
    expect(savedExecution.status).toBe('in-progress');
    expect(savedExecution.logs.length).toBe(1);
    expect(savedExecution.logs[0].level).toBe('info');
  });

  it('should track execution completion', async () => {
    // Arrange
    const executionId = 'exec-123';
    const output = 'Task completed successfully';
    const mockExecution = {
      id: executionId,
      status: 'in-progress',
      startedAt: new Date(Date.now() - 1000), // 1 segundo atrás
      logs: [],
    };
    mockTaskRepository.findExecutionById.mockResolvedValue(mockExecution);
    mockTaskRepository.saveExecution.mockResolvedValue(undefined);

    // Act
    await service.trackExecutionCompletion(executionId, output, true);

    // Assert
    expect(mockTaskRepository.findExecutionById).toHaveBeenCalledWith(
      executionId,
    );
    expect(mockTaskRepository.saveExecution).toHaveBeenCalledTimes(1);
    const savedExecution = mockTaskRepository.saveExecution.mock.calls[0][0];
    expect(savedExecution.status).toBe('completed');
    expect(savedExecution.output).toBe(output);
    expect(savedExecution.finishedAt).toBeDefined();
    expect(savedExecution.executionTime).toBeGreaterThanOrEqual(0);
    expect(savedExecution.logs.length).toBe(1);
  });

  it('should track execution failure', async () => {
    // Arrange
    const executionId = 'exec-123';
    const errorMsg = 'Error during execution';
    const mockExecution = {
      id: executionId,
      status: 'in-progress',
      startedAt: new Date(Date.now() - 1000), // 1 segundo atrás
      logs: [],
    };
    mockTaskRepository.findExecutionById.mockResolvedValue(mockExecution);
    mockTaskRepository.saveExecution.mockResolvedValue(undefined);

    // Act
    await service.trackExecutionFailure(executionId, errorMsg);

    // Assert
    expect(mockTaskRepository.findExecutionById).toHaveBeenCalledWith(
      executionId,
    );
    expect(mockTaskRepository.saveExecution).toHaveBeenCalledTimes(1);
    const savedExecution = mockTaskRepository.saveExecution.mock.calls[0][0];
    expect(savedExecution.status).toBe('failed');
    expect(savedExecution.error).toBe(errorMsg);
    expect(savedExecution.finishedAt).toBeDefined();
    expect(savedExecution.logs[0].level).toBe('error');
  });

  it('should add execution log', async () => {
    // Arrange
    const executionId = 'exec-123';
    const logMessage = 'Test log message';
    const mockExecution = {
      id: executionId,
      logs: [],
    };
    mockTaskRepository.findExecutionById.mockResolvedValue(mockExecution);
    mockTaskRepository.saveExecution.mockResolvedValue(undefined);

    // Act
    await service.addExecutionLog(executionId, 'info', logMessage);

    // Assert
    expect(mockTaskRepository.findExecutionById).toHaveBeenCalledWith(
      executionId,
    );
    expect(mockTaskRepository.saveExecution).toHaveBeenCalledTimes(1);
    const savedExecution = mockTaskRepository.saveExecution.mock.calls[0][0];
    expect(savedExecution.logs.length).toBe(1);
    expect(savedExecution.logs[0].message).toBe(logMessage);
    expect(savedExecution.logs[0].level).toBe('info');
  });

  it('should generate execution report', async () => {
    // Arrange
    const executionId = 'exec-123';
    const taskId = 'task-123';
    const mockExecution = {
      id: executionId,
      taskId,
      agentId: 'agent-123',
      status: 'completed',
      startedAt: new Date(),
      finishedAt: new Date(),
      executionTime: 1500,
      attempts: 1,
      logs: [
        { timestamp: new Date(), level: 'info', message: 'Start' },
        { timestamp: new Date(), level: 'info', message: 'Complete' },
      ],
      output: 'Test output',
    };
    const mockTask = {
      id: taskId,
      description: 'Test task',
    };

    mockTaskRepository.findExecutionById.mockResolvedValue(mockExecution);
    mockTaskRepository.findById.mockResolvedValue(mockTask);

    // Act
    const report = await service.generateExecutionReport(executionId);

    // Assert
    expect(report).toBeDefined();
    expect(report.executionId).toBe(executionId);
    expect(report.taskId).toBe(taskId);
    expect(report.taskDescription).toBe('Test task');
    expect(report.status).toBe('completed');
    expect(report.logSummary).toHaveProperty('info', 2);
    expect(report.outputPreview).toBe('Test output');
  });

  it('should generate task execution summary', async () => {
    // Arrange
    const taskId = 'task-123';
    const mockTask = {
      id: taskId,
      description: 'Test task',
    };
    const mockExecutions = [
      {
        id: 'exec-1',
        taskId,
        status: 'completed',
        startedAt: new Date(),
        finishedAt: new Date(),
        executionTime: 1000,
      },
      {
        id: 'exec-2',
        taskId,
        status: 'completed',
        startedAt: new Date(),
        finishedAt: new Date(),
        executionTime: 2000,
      },
      {
        id: 'exec-3',
        taskId,
        status: 'failed',
        startedAt: new Date(),
        finishedAt: new Date(),
      },
    ];

    mockTaskRepository.findExecutions.mockResolvedValue(mockExecutions);
    mockTaskRepository.findById.mockResolvedValue(mockTask);

    // Act
    const summary = await service.generateTaskExecutionSummary(taskId);

    // Assert
    expect(summary).toBeDefined();
    expect(summary.taskId).toBe(taskId);
    expect(summary.taskDescription).toBe('Test task');
    expect(summary.totalExecutions).toBe(3);
    expect(summary.statistics.successful).toBe(2);
    expect(summary.statistics.failed).toBe(1);
    expect(summary.recentExecutions).toHaveLength(3);
  });

  it('should handle empty executions when generating summary', async () => {
    // Arrange
    const taskId = 'task-123';
    mockTaskRepository.findExecutions.mockResolvedValue([]);

    // Act
    const summary = await service.generateTaskExecutionSummary(taskId);

    // Assert
    expect(summary).toBeDefined();
    expect(summary.taskId).toBe(taskId);
    expect(summary.totalExecutions).toBe(0);
    expect(summary.message).toBe('No executions found for this task');
  });
});
