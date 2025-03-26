import { Test, TestingModule } from '@nestjs/testing';
import { DeleteAgentService } from '../services/delete-agent.service';
import { NotFoundException } from '@nestjs/common';

describe('DeleteAgentService', () => {
  let service: DeleteAgentService;
  let mockAgentRepository: any;

  beforeEach(async () => {
    // Criar mock do repositório
    mockAgentRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAgentService,
        { provide: 'IAgentRepository', useValue: mockAgentRepository },
      ],
    }).compile();

    service = module.get<DeleteAgentService>(DeleteAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete an agent successfully', async () => {
    // Arrange
    const agentId = 'test-agent-id';
    const mockAgent = { id: agentId, role: 'Tester' };
    mockAgentRepository.findById.mockResolvedValue(mockAgent);
    mockAgentRepository.delete.mockResolvedValue(undefined);

    // Act
    await service.execute(agentId);

    // Assert
    expect(mockAgentRepository.findById).toHaveBeenCalledWith(agentId);
    expect(mockAgentRepository.delete).toHaveBeenCalledWith(agentId);
  });

  it('should throw NotFoundException when agent does not exist', async () => {
    // Arrange
    const agentId = 'non-existent-agent';
    mockAgentRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.execute(agentId)).rejects.toThrowError(
      NotFoundException,
    );
    expect(mockAgentRepository.findById).toHaveBeenCalledWith(agentId);
    expect(mockAgentRepository.delete).not.toHaveBeenCalled();
  });

  it('should propagate repository errors', async () => {
    // Arrange
    const agentId = 'test-agent-id';
    const mockError = new Error('Database connection failed');
    mockAgentRepository.findById.mockRejectedValue(mockError);

    // Act & Assert
    await expect(service.execute(agentId)).rejects.toThrow(mockError);
    expect(mockAgentRepository.findById).toHaveBeenCalledWith(agentId);
  });
});
