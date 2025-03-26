import { Test, TestingModule } from '@nestjs/testing';
import { AgentManagerService } from '../services/agent-manager.service';
import { AgentFactoryService } from '../services/agent-factory.service';

describe('AgentManagerService', () => {
  let service: AgentManagerService;
  let mockAgentFactoryService: Partial<AgentFactoryService>;

  beforeEach(async () => {
    mockAgentFactoryService = {
      createAgent: jest.fn().mockResolvedValue({ id: 'mock-agent-id' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentManagerService,
        { provide: AgentFactoryService, useValue: mockAgentFactoryService },
      ],
    }).compile();

    service = module.get<AgentManagerService>(AgentManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a crew', async () => {
    const crewConfig = {
      agents: [
        {
          id: 'agent-1',
          role: 'developer',
          goal: 'build features',
          backstory: 'Experienced developer',
        },
      ],
      tasks: [
        {
          description: 'Implement feature X',
          expectedOutput: 'Feature X implemented',
        },
      ],
    };

    const result = await service.createCrew(crewConfig);

    expect(result).toBeDefined();
    expect(mockAgentFactoryService.createAgent).toHaveBeenCalled();
  });
});
