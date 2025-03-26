import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateTaskService,
  CreateTaskParams,
} from '../services/create-task.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('CreateTaskService', () => {
  let service: CreateTaskService;
  let mockTaskRepository: any;
  let mockEventEmitter: any;

  beforeEach(async () => {
    mockTaskRepository = {
      create: jest.fn().mockImplementation((taskData) => taskData.id),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskService,
        { provide: 'ITaskRepository', useValue: mockTaskRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<CreateTaskService>(CreateTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a task and return its ID', async () => {
    const mockTaskData: CreateTaskParams = {
      // Adicionado tipo explícito
      description: 'Test task',
      expectedOutput: 'Expected result',
      context: {},
      priority: 'high', // Corrigido para um valor válido do tipo "low" | "medium" | "high" | "critical"
      deadline: new Date(),
      assignedAgentId: 'agent-1',
      assignedCrewId: 'crew-1',
      dependencies: [],
      tags: ['test'],
      templateId: 'template-1',
    };

    const result = await service.execute(mockTaskData);

    expect(result).toBeDefined();
    expect(result).toMatch(/^task-[a-f0-9-]+$/); // Verifica o formato do ID gerado
    expect(mockTaskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Test task',
        expectedOutput: 'Expected result',
      }),
    );
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'task.created',
      expect.any(Object),
    );
  });
});
