import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { QdrantService, QdrantVectorPoint } from './qdrant.service';
import { GroqEmbedderService } from './groq-embedder.service';
import { EMBEDDER_SERVICE_TOKEN } from '../ports/embedder.service.interface';
import { ConfigService } from '@nestjs/config';

describe('SearchService AI Query Pipeline & Advanced Filters', () => {
  let searchService: SearchService;
  let qdrantService: QdrantService;
  let embedderService: GroqEmbedderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        QdrantService,
        GroqEmbedderService,
        {
          provide: EMBEDDER_SERVICE_TOKEN,
          useClass: GroqEmbedderService,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(undefined) },
        },
      ],
    }).compile();

    searchService = module.get<SearchService>(SearchService);
    qdrantService = module.get<QdrantService>(QdrantService);
    embedderService = module.get<GroqEmbedderService>(GroqEmbedderService);

    await qdrantService.onModuleInit();
  });

  it('should find cocaine/heroin messages for query "Find messages mentioning drugs" with high relevance score', async () => {
    const text1 = embedderService.enrichMessageText('TraderJoe', new Date('2024-03-10'), 'Pure cocaine and heroin for sale.');
    const text2 = embedderService.enrichMessageText('SecGuard', new Date('2024-03-10'), 'New firewall patch release notes.');

    const vec1 = await embedderService.generateEmbedding(text1);
    const vec2 = await embedderService.generateEmbedding(text2);

    const samplePoints: QdrantVectorPoint[] = [
      {
        id: 'msg-1',
        vector: vec1,
        payload: {
          messageId: 'msg-1',
          telegramId: '101',
          sender: 'TraderJoe',
          date: '2024-03-10T14:20:00.000Z',
          text: 'Pure cocaine and heroin for sale.',
          batchId: 'batch-1',
        },
      },
      {
        id: 'msg-2',
        vector: vec2,
        payload: {
          messageId: 'msg-2',
          telegramId: '102',
          sender: 'SecGuard',
          date: '2024-03-10T14:25:00.000Z',
          text: 'New firewall patch release notes.',
          batchId: 'batch-1',
        },
      },
    ];

    await qdrantService.upsertVectors(samplePoints);

    const response = await searchService.search({
      query: 'Find messages mentioning drugs',
      limit: 10,
      minRelevanceScore: 0,
    });

    expect(response).toBeDefined();
    expect(response.totalResults).toBe(2);

    const topResult = response.results[0];
    expect(topResult.sender).toBe('TraderJoe');
    expect(topResult.text).toBe('Pure cocaine and heroin for sale.');
    expect(topResult.timestamp).toBe('2024-03-10T14:20:00.000Z');
    expect(topResult.relevanceScore).toBeGreaterThan(60.0);
  });

  it('should filter out results below minRelevanceScore threshold', async () => {
    const response = await searchService.search({
      query: 'Find messages mentioning drugs',
      limit: 10,
      minRelevanceScore: 70.0,
    });

    expect(response.results.every((r) => r.relevanceScore >= 70.0)).toBe(true);
  });
});
