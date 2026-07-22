import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GroqEmbedderService } from './groq-embedder.service';

describe('GroqEmbedderService', () => {
  let service: GroqEmbedderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroqEmbedderService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<GroqEmbedderService>(GroqEmbedderService);
  });

  describe('enrichMessageText', () => {
    it('should format sender, date, and text into enriched context representation', () => {
      const date = new Date('2024-05-15T10:00:00Z');
      const enriched = service.enrichMessageText('TraderJoe', date, ' Pure cocaine sample ');

      expect(enriched).toBe('[Sender: TraderJoe] [Date: 2024-05-15] Pure cocaine sample');
    });
  });

  describe('generateEmbedding', () => {
    it('should return a 384-dimensional normalized float array', async () => {
      const vector = await service.generateEmbedding('Find messages mentioning drugs');

      expect(vector).toBeDefined();
      expect(Array.isArray(vector)).toBe(true);
      expect(vector.length).toBe(384);

      // Verify L2 Unit Normalization (sum of squares = 1)
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      expect(magnitude).toBeCloseTo(1.0, 4);
    });

    it('should produce high cosine similarity between related semantic queries ("drugs" and "cocaine")', async () => {
      const vecDrugs = await service.generateEmbedding('Find messages mentioning drugs');
      const vecCocaine = await service.generateEmbedding('We have pure cocaine and heroin available');

      // Cosine Similarity dot product for unit vectors
      const similarity = vecDrugs.reduce((sum, val, idx) => sum + val * vecCocaine[idx], 0);

      expect(similarity).toBeGreaterThan(0.5);
    });
  });

  describe('generateBatchEmbeddings', () => {
    it('should generate embeddings in batches', async () => {
      const texts = ['Message 1', 'Message 2', 'Message 3'];
      const batchVectors = await service.generateBatchEmbeddings(texts);

      expect(batchVectors.length).toBe(3);
      expect(batchVectors[0].length).toBe(384);
    });
  });
});
