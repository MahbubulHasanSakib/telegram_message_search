import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { TgExportParserService } from './services/tg-export-parser.service';
import { PrismaService } from '../database/prisma.service';

describe('MessagesService DB Integration', () => {
  let service: MessagesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    exportBatch: {
      create: jest.fn().mockResolvedValue({
        id: 'batch-uuid-123',
        filename: 'export.json',
        channelName: 'Test Channel',
        messageCount: 2,
        status: 'PROCESSING',
        createdAt: new Date(),
      }),
      update: jest.fn().mockResolvedValue({
        id: 'batch-uuid-123',
        filename: 'export.json',
        channelName: 'Test Channel',
        messageCount: 2,
        status: 'COMPLETED',
        createdAt: new Date(),
      }),
    },
    message: {
      createMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
  };

  const mockParserService = {
    parseExportFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: TgExportParserService, useValue: mockParserService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should store parsed messages into database using bulk createMany chunks', async () => {
    const mockMessages = [
      {
        telegramId: '101',
        date: new Date(),
        sender: 'Alice',
        text: 'Suspicious transaction noted',
      },
      {
        telegramId: '102',
        date: new Date(),
        sender: 'Bob',
        text: 'Malware binary attached',
      },
    ];

    const result = await service.storeExportMessages('export.json', 'Test Channel', mockMessages);

    expect(result).toBeDefined();
    expect(result.batchId).toBe('batch-uuid-123');
    expect(result.status).toBe('COMPLETED');
    expect(prisma.exportBatch.create).toHaveBeenCalled();
    expect(prisma.message.createMany).toHaveBeenCalled();
  });
});
