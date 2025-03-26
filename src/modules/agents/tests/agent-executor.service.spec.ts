import { Test, TestingModule } from '@nestjs/testing';
import { AgentExecutorService } from '../services/agent-executor.service';
import { AgentManagerService } from '../services/agent-manager.service';

describe('AgentExecutorService', () => {
  let service: AgentExecutorService;
  let mockAgentManagerService: any;

  beforeEach(async () => {
    mockAgentManagerService = {
      getCrew: jest.fn().mockResolvedValue({
        runTask: jest.fn().mockResolvedValue({
          taskId: 'task-id',
          agentId: 'agent-id',
          output: 'Task executed successfully',
          success: true,
          executionTime: 1500,
          metadata: { key: 'value' },
        }),
        id: 'crew-id',
      }),
      createBackendCrew: jest.fn().mockResolvedValue('backend-crew-id'),
      createFullStackCrew: jest.fn().mockResolvedValue('fullstack-crew-id'),
    };

    // Adicionar propriedade crews para simular o acesso interno no serviço
    mockAgentManagerService.crews = new Map();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentExecutorService,
        { provide: AgentManagerService, useValue: mockAgentManagerService },
      ],
    }).compile();

    service = module.get<AgentExecutorService>(AgentExecutorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should execute a task and return a result', async () => {
    // Arrange
    const crewId = 'crew-id';
    const taskId = 'task-id';
    const input = { key: 'value' };

    // Act
    const result = await service.executeTask(crewId, taskId, input);

    // Assert
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('output', 'Task executed successfully');
    expect(mockAgentManagerService.getCrew).toHaveBeenCalledWith(crewId);
  });

  it('should handle errors when executing a task', async () => {
    // Arrange
    const crewId = 'error-crew-id';
    const taskId = 'task-id';
    const mockError = new Error('Failed to execute task');

    mockAgentManagerService.getCrew.mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(service.executeTask(crewId, taskId)).rejects.toThrow(
      mockError,
    );
  });

  it('should execute a backend task', async () => {
    // Arrange
    const input = {
      resource: 'User',
      endpoints: ['GET /users', 'POST /users'],
      methods: ['findAll', 'create'],
    };

    // Simular uma crew existente com um agente Backend Developer
    mockAgentManagerService.crews.set('existing-crew', {
      id: 'existing-crew',
      agents: [{ role: 'Backend Developer' }],
    });

    jest.spyOn(service, 'executeTask').mockResolvedValueOnce({
      taskId: 'create-api',
      agentId: 'agent-id',
      output: 'API code generated',
      success: true,
      executionTime: 2000,
    });

    // Act
    const result = await service.executeBackendTask(input);

    // Assert
    expect(result).toBe('API code generated');
    expect(service.executeTask).toHaveBeenCalledWith(
      'existing-crew',
      'create-api',
      input,
    );
    expect(mockAgentManagerService.createBackendCrew).not.toHaveBeenCalled();
  });

  it('should create a new backend crew if none exists', async () => {
    // Arrange
    const input = {
      resource: 'User',
      endpoints: ['GET /users', 'POST /users'],
      methods: ['findAll', 'create'],
    };

    // Limpar crews simuladas para forçar a criação de nova crew
    mockAgentManagerService.crews.clear();

    jest.spyOn(service, 'executeTask').mockResolvedValueOnce({
      taskId: 'create-api',
      agentId: 'agent-id',
      output: 'API code generated',
      success: true,
      executionTime: 2000,
    });

    // Act
    const result = await service.executeBackendTask(input);

    // Assert
    expect(result).toBe('API code generated');
    expect(mockAgentManagerService.createBackendCrew).toHaveBeenCalled();
    expect(service.executeTask).toHaveBeenCalledWith(
      'backend-crew-id',
      'create-api',
      input,
    );
  });

  it('should execute a full-stack task', async () => {
    // Arrange
    const input = {
      feature: 'User Registration',
      endpoints: ['POST /users', 'GET /users/verify'],
      components: ['RegistrationForm', 'VerificationPage'],
    };

    // Simular uma crew existente com agentes Backend e Frontend
    mockAgentManagerService.crews.set('fullstack-crew', {
      id: 'fullstack-crew',
      agents: [{ role: 'Backend Developer' }, { role: 'Frontend Developer' }],
    });

    jest.spyOn(service, 'executeTask').mockResolvedValueOnce({
      taskId: 'create-fullstack-feature',
      agentId: 'agent-id',
      output: 'Backend code here\nFRONTEND\nFrontend code here',
      success: true,
      executionTime: 3000,
    });

    // Act
    const result = await service.executeFullStackTask(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.backend).toBe('Backend code here');
    expect(result.frontend).toBe('Frontend code here');
    expect(service.executeTask).toHaveBeenCalledWith(
      'fullstack-crew',
      'create-fullstack-feature',
      input,
    );
  });

  it('should handle no frontend output in full-stack task', async () => {
    // Arrange
    const input = {
      feature: 'API Only Feature',
      endpoints: ['GET /data'],
      components: [],
    };

    mockAgentManagerService.crews.set('fullstack-crew', {
      id: 'fullstack-crew',
      agents: [{ role: 'Backend Developer' }, { role: 'Frontend Developer' }],
    });

    jest.spyOn(service, 'executeTask').mockResolvedValueOnce({
      taskId: 'create-fullstack-feature',
      agentId: 'agent-id',
      output: 'Backend code only',
      success: true,
      executionTime: 1000,
    });

    // Act
    const result = await service.executeFullStackTask(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.backend).toBe('Backend code only');
    expect(result.frontend).toBe('No frontend code generated');
  });
});
