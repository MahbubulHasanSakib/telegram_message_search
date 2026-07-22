import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QdrantService, QdrantVectorPoint } from './qdrant.service';

describe('QdrantService', () => {
  let service: QdrantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QdrantService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<QdrantService>(QdrantService);
    await service.onModuleInit();
  });

  it('should upsert and retrieve vector points by cosine similarity', async () => {
    const vec1 = new Array(384).fill(0);
    vec1[0] = 1.0; // Pointing along dimension 0

    const vec2 = new Array(384).fill(0);
    vec2[1] = 1.0; // Pointing along dimension 1

    const samplePoints: QdrantVectorPoint[] = [
      {
        id: 'msg-uuid-1',
        vector: vec1,
        payload: {
          messageId: 'msg-uuid-1',
          telegramId: '101',
          sender: 'TraderJoe',
          date: '2024-03-10T14:20:00Z',
          text: 'Selling pure MDMA and Cocaine',
          batchId: 'batch-1',
        },
      },
      {
        id: 'msg-uuid-2',
        vector: vec2,
        payload: {
          messageId: 'msg-uuid-2',
          telegramId: '102',
          sender: 'SecResearcher',
          date: '2024-03-10T14:25:00Z',
          text: 'Ransomware threat intelligence report',
          batchId: 'batch-1',
        },
      },
    ];

    await service.upsertVectors(samplePoints);

    // Query pointing along dimension 0
    const queryVec = new Array(384).fill(0);
    queryVec[0] = 1.0;

    const searchResults = await service.searchVectors(queryVec, 10);

    expect(searchResults).toBeDefined();
    expect(searchResults.length).toBe(2);
    expect(searchResults[0].id).toBe('msg-uuid-1'); // Vector 1 should rank #1 with score 1.0
    expect(searchResults[0].score).toBeCloseTo(1.0, 3);
    expect(searchResults[0].payload.sender).toBe('TraderJoe');
  });

  it('should apply payload filtering by sender handle', async () => {
    const samplePoints: QdrantVectorPoint[] = [
      {
        id: 'p1',
        vector: [1, 0, 0],
        payload: {
          messageId: 'p1',
          telegramId: '1',
          sender: 'Alice',
          date: '2024-01-01',
          text: 'Text 1',
          batchId: 'b1',
        },
      },
      {
        id: 'p2',
        vector: [1, 0, 0],
        payload: {
          messageId: 'p2',
          telegramId: '2',
          sender: 'Bob',
          date: '2024-01-01',
          text: 'Text 2',
          batchId: 'b1',
        },
      },
    ];

    await service.upsertVectors(samplePoints);

    const aliceResults = await service.searchVectors([1, 0, 0], 10, 'Alice');

    expect(aliceResults.length).toBe(1);
    expect(aliceResults[0].payload.sender).toBe('Alice');
  });
});
