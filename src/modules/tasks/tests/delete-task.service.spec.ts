import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTaskService } from '../services/delete-task.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';

describe('DeleteTaskService', () => {
  let service: DeleteTaskService;
  let mockTaskRepository: any;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    // Configurar mocks
    mockTaskRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
      findExecutions: jest.fn(),
    };

    eventEmitter = new EventEmitter2();
    jest.spyOn(eventEmitter, 'emit');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTaskService,
        { provide: 'ITaskRepository', useValue: mockTaskRepository },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<DeleteTaskService>(DeleteTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete a task successfully', async () => {
    // Arrange
    const taskId = 'test-task-id';
    const mockTask = { id: taskId, description: 'Test task' };
    mockTaskRepository.findById.mockResolvedValue(mockTask);
    mockTaskRepository.findExecutions.mockResolvedValue([
      { status: 'completed', id: 'exec-1' },
      { status: 'failed', id: 'exec-2' },
    ]);
    mockTaskRepository.delete.mockResolvedValue(undefined);

    // Act
    await service.execute(taskId);

    // Assert
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.findExecutions).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
    expect(eventEmitter.emit).toHaveBeenCalledWith('task.deleted', {
      taskId,
      taskDetails: mockTask,
    });
  });

  it('should throw NotFoundException when task does not exist', async () => {
    // Arrange
    const taskId = 'non-existent-task';
    mockTaskRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.execute(taskId)).rejects.toThrowError(
      NotFoundException,
    );
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should throw error when task has active executions', async () => {
    // Arrange
    const taskId = 'task-with-active-executions';
    mockTaskRepository.findById.mockResolvedValue({
      id: taskId,
      description: 'Test task',
    });
    mockTaskRepository.findExecutions.mockResolvedValue([
      { status: 'completed', id: 'exec-1' },
      { status: 'in-progress', id: 'exec-2' }, // Execução ativa
    ]);

    // Act & Assert
    await expect(service.execute(taskId)).rejects.toThrowError(
      'Cannot delete task with active executions. Please cancel executions first.',
    );
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.findExecutions).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle batch deletion successfully', async () => {
    // Arrange
    const taskIds = ['task-1', 'task-2', 'task-3'];

    // Mock para task-1: sucesso
    mockTaskRepository.findById.mockImplementationOnce(() => ({
      id: 'task-1',
      description: 'Task 1',
    }));
    mockTaskRepository.findExecutions.mockImplementationOnce(() => [
      { status: 'completed' },
    ]);

    // Mock para task-2: falha (não existe)
    mockTaskRepository.findById.mockImplementationOnce(() => null);

    // Mock para task-3: falha (execução ativa)
    mockTaskRepository.findById.mockImplementationOnce(() => ({
      id: 'task-3',
      description: 'Task 3',
    }));
    mockTaskRepository.findExecutions.mockImplementationOnce(() => [
      { status: 'in-progress' },
    ]);

    // Act
    const result = await service.batchDelete(taskIds);

    // Assert
    expect(result.success).toContain('task-1');
    expect(result.failed).toHaveLength(2);
    expect(result.failed.find((f) => f.id === 'task-2')).toBeDefined();
    expect(result.failed.find((f) => f.id === 'task-3')).toBeDefined();
    expect(mockTaskRepository.delete).toHaveBeenCalledTimes(1);
    expect(mockTaskRepository.delete).toHaveBeenCalledWith('task-1');
  });
});
