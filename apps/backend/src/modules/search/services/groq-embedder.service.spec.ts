import { Test, TestingModule } from '@nestjs/testing';
import { GroqEmbedderService } from './groq-embedder.service';

describe('GroqEmbedderService', () => {
  let service: GroqEmbedderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroqEmbedderService,
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
    it('should return normalized 384-dimensional vector embedding values', async () => {
      const vector = await service.generateEmbedding('malware payload sample');

      expect(vector).toBeInstanceOf(Array);
      expect(vector).toHaveLength(384);

      // Check unit magnitude normalization (L2 norm)
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      expect(magnitude).toBeCloseTo(1.0, 5);
    });

    it('should produce semantically distinct vectors for threat categories', async () => {
      const drugVector = await service.generateEmbedding('cocaine dealer in group');
      const malwareVector = await service.generateEmbedding('ransomware campaign');
      const cleanVector = await service.generateEmbedding('football match time');

      // Cosine distance similarity tests
      const drugMalwareSim = drugVector.reduce((sum, val, idx) => sum + val * malwareVector[idx], 0);
      const drugCleanSim = drugVector.reduce((sum, val, idx) => sum + val * cleanVector[idx], 0);

      expect(drugMalwareSim).toBeLessThan(0.7);
      expect(drugCleanSim).toBeLessThan(0.5);
    });
  });
});
