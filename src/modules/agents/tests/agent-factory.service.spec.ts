import { Test, TestingModule } from '@nestjs/testing';
import { AgentFactoryService } from '../services/agent-factory.service';
import { AIProviderFactory } from '../../../shared/providers/ai-provider.factory';

describe('AgentFactoryService', () => {
  let service: AgentFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentFactoryService,
        { provide: AIProviderFactory, useValue: {} },
      ],
    }).compile();

    service = module.get<AgentFactoryService>(AgentFactoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests here as needed
});
