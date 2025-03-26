import { Test, TestingModule } from '@nestjs/testing';
import { CreateAgentService } from '../services/create-agent.service';
import { AgentManagerService } from '../services/agent-manager.service';

describe('CreateAgentService', () => {
  let service: CreateAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAgentService,
        { provide: AgentManagerService, useValue: {} },
      ],
    }).compile();

    service = module.get<CreateAgentService>(CreateAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests here as needed
});
