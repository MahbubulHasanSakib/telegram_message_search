import { Test, TestingModule } from '@nestjs/testing';
import { IndexingService } from './indexing.service';
import { MessagesService } from '../../messages/messages.service';
import { QdrantService } from './qdrant.service';
import { GroqEmbedderService } from './groq-embedder.service';
import { EMBEDDER_SERVICE_TOKEN } from '../ports/embedder.service.interface';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

describe('IndexingService', () => {
  let indexingService: IndexingService;

  const mockMessagesService = {
    parseAndStoreExport: jest.fn().mockResolvedValue({ batchId: 'batch-123' }),
    parseExportFile: jest.fn().mockResolvedValue({
      fileId: 'export.json',
      channelName: 'Test Channel',
      totalParsedMessages: 1,
      messages: [
        {
          telegramId: '101',
          date: new Date('2024-03-10'),
          sender: 'TraderJoe',
          text: 'Selling pure MDMA and Cocaine',
        },
      ],
    }),
  };

  const mockQdrantService = {
    upsertVectors: jest.fn().mockResolvedValue(undefined),
  };

  const mockPrismaService = {
    message: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndexingService,
        GroqEmbedderService,
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: QdrantService, useValue: mockQdrantService },
        { provide: EMBEDDER_SERVICE_TOKEN, useClass: GroqEmbedderService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    indexingService = module.get<IndexingService>(IndexingService);
  });

  it('should parse export, generate vector embeddings, and upsert vectors into Qdrant', async () => {
    const result = await indexingService.parseAndIndexExport('export.json');

    expect(result).toBeDefined();
    expect(result.batchId).toBe('batch-123');
    expect(result.totalMessagesIndexed).toBe(1);
    expect(result.status).toBe('INDEXED');
    expect(mockQdrantService.upsertVectors).toHaveBeenCalled();
  });
});
