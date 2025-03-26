import { Test, TestingModule } from '@nestjs/testing';
import { TasksMqController } from '../controllers/mq.controller';
import { TaskManagerService } from '../services/task-manager.service';
import { TaskExecutorService } from '../services/task-executor.service';
import { CreateTaskService } from '../services/create-task.service';
import { ExecuteTaskService } from '../services/execute-task.service';
import { FindTaskService } from '../services/find-task.service';
import { UpdateTaskService } from '../services/update-task.service';
import { DeleteTaskService } from '../services/delete-task.service';
import { TrackTaskService } from '../services/track-task.service';

describe('TasksMqController', () => {
  let controller: TasksMqController;
  let mockCreateTaskService: Partial<CreateTaskService>;

  beforeEach(async () => {
    mockCreateTaskService = {
      execute: jest.fn().mockResolvedValue('mock-task-id'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksMqController],
      providers: [
        { provide: CreateTaskService, useValue: mockCreateTaskService },
        { provide: TaskManagerService, useValue: {} },
        { provide: TaskExecutorService, useValue: {} },
        { provide: ExecuteTaskService, useValue: {} },
        { provide: FindTaskService, useValue: {} },
        { provide: UpdateTaskService, useValue: {} },
        { provide: DeleteTaskService, useValue: {} },
        { provide: TrackTaskService, useValue: {} },
      ],
    }).compile();

    controller = module.get<TasksMqController>(TasksMqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handle create_task message', async () => {
    const payload = {
      description: 'Test task',
      expectedOutput: 'Output',
      context: {},
      priority: 'high',
      deadline: new Date(),
      assignedAgentId: 'agent-1',
      assignedCrewId: 'crew-1',
      dependencies: [],
      tags: ['test'],
      templateId: 'template-1',
    };

    const context = {
      getChannelRef: jest.fn().mockReturnValue({ ack: jest.fn() }),
      getMessage: jest.fn().mockReturnValue({}),
    } as any;

    const result = await controller.createTask(payload, context);

    expect(mockCreateTaskService.execute).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ taskId: 'mock-task-id', success: true });
  });
});
