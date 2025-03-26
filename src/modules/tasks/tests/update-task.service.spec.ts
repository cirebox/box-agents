import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTaskService } from '../services/update-task.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';

describe('UpdateTaskService', () => {
  let service: UpdateTaskService;
  let mockTaskRepository: any;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    // Configurar mocks
    mockTaskRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    eventEmitter = new EventEmitter2();
    jest.spyOn(eventEmitter, 'emit');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTaskService,
        { provide: 'ITaskRepository', useValue: mockTaskRepository },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<UpdateTaskService>(UpdateTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update a task successfully', async () => {
    // Arrange
    const taskId = 'task-123';
    const mockTask = {
      id: taskId,
      description: 'Original description',
      assignedAgentId: null,
    };
    const updates = {
      description: 'Updated description',
    };

    mockTaskRepository.findById.mockResolvedValue(mockTask);
    mockTaskRepository.update.mockResolvedValue(undefined);

    // Act
    await service.execute(taskId, updates);

    // Assert
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updates);
    expect(eventEmitter.emit).toHaveBeenCalledWith('task.updated', {
      taskId,
      updates,
      previousState: mockTask,
    });
  });

  it('should throw NotFoundException when updating a non-existent task', async () => {
    // Arrange
    const taskId = 'non-existent-task';
    const updates = { description: 'New description' };

    mockTaskRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.execute(taskId, updates)).rejects.toThrowError(
      NotFoundException,
    );
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.update).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should emit task.assigned event when assignedAgentId is updated', async () => {
    // Arrange
    const taskId = 'task-123';
    const originalAgentId = 'agent-100';
    const newAgentId = 'agent-200';
    const mockTask = {
      id: taskId,
      description: 'Original description',
      assignedAgentId: originalAgentId,
    };
    const updates = {
      assignedAgentId: newAgentId,
    };

    mockTaskRepository.findById.mockResolvedValue(mockTask);
    mockTaskRepository.update.mockResolvedValue(undefined);

    // Act
    await service.execute(taskId, updates);

    // Assert
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updates);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'task.updated',
      expect.any(Object),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith('task.assigned', {
      taskId,
      agentId: newAgentId,
      previousAgentId: originalAgentId,
    });
  });

  it('should emit task.assigned_to_crew event when assignedCrewId is updated', async () => {
    // Arrange
    const taskId = 'task-123';
    const originalCrewId = 'crew-100';
    const newCrewId = 'crew-200';
    const mockTask = {
      id: taskId,
      description: 'Original description',
      assignedCrewId: originalCrewId,
    };
    const updates = {
      assignedCrewId: newCrewId,
    };

    mockTaskRepository.findById.mockResolvedValue(mockTask);
    mockTaskRepository.update.mockResolvedValue(undefined);

    // Act
    await service.execute(taskId, updates);

    // Assert
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updates);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'task.updated',
      expect.any(Object),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith('task.assigned_to_crew', {
      taskId,
      crewId: newCrewId,
      previousCrewId: originalCrewId,
    });
  });

  it('should update task priority', async () => {
    // Arrange
    const taskId = 'task-123';
    const priority = 'high';

    // Espiar o método execute
    jest.spyOn(service, 'execute').mockResolvedValue();

    // Act
    await service.updatePriority(taskId, priority);

    // Assert
    expect(service.execute).toHaveBeenCalledWith(taskId, { priority });
  });

  it('should assign task to agent', async () => {
    // Arrange
    const taskId = 'task-123';
    const agentId = 'agent-456';

    // Espiar o método execute
    jest.spyOn(service, 'execute').mockResolvedValue();

    // Act
    await service.assignToAgent(taskId, agentId);

    // Assert
    expect(service.execute).toHaveBeenCalledWith(taskId, {
      assignedAgentId: agentId,
    });
  });

  it('should assign task to crew', async () => {
    // Arrange
    const taskId = 'task-123';
    const crewId = 'crew-456';

    // Espiar o método execute
    jest.spyOn(service, 'execute').mockResolvedValue();

    // Act
    await service.assignToCrew(taskId, crewId);

    // Assert
    expect(service.execute).toHaveBeenCalledWith(taskId, {
      assignedCrewId: crewId,
    });
  });

  it('should propagate errors from repository', async () => {
    // Arrange
    const taskId = 'task-123';
    const updates = { description: 'Updated description' };
    const mockError = new Error('Repository error');

    mockTaskRepository.findById.mockRejectedValue(mockError);

    // Act & Assert
    await expect(service.execute(taskId, updates)).rejects.toThrow(mockError);
  });
});
