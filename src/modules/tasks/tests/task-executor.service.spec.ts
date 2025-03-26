import { Test, TestingModule } from '@nestjs/testing';
import { TaskExecutorService } from '../services/task-executor.service';
import { TaskManagerService } from '../services/task-manager.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AIProviderFactory } from 'src/shared/providers/ai-provider.factory';
import { PromptEngineeringHelper } from 'src/shared/helpers/prompt-engineering.helper';

describe('TaskExecutorService', () => {
  let service: TaskExecutorService;
  let taskManagerService: TaskManagerService;
  let eventEmitter: EventEmitter2;
  let aiProviderFactory: AIProviderFactory;
  let promptEngineeringHelper: PromptEngineeringHelper;

  beforeEach(async () => {
    // Inicialização dos mocks
    taskManagerService = {} as TaskManagerService;
    eventEmitter = new EventEmitter2();
    aiProviderFactory = {} as AIProviderFactory;
    promptEngineeringHelper = {} as PromptEngineeringHelper;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskExecutorService,
        { provide: TaskManagerService, useValue: taskManagerService },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: AIProviderFactory, useValue: aiProviderFactory },
        { provide: PromptEngineeringHelper, useValue: promptEngineeringHelper },
      ],
    }).compile();

    service = module.get<TaskExecutorService>(TaskExecutorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Adicione mais testes conforme necessário
});
