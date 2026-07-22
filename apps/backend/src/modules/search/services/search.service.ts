import { Injectable, Logger, Inject } from '@nestjs/common';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResponseDto, SearchResultItemDto } from '../dto/search-result.dto';
import { QdrantService } from './qdrant.service';
import { IEmbedderService, EMBEDDER_SERVICE_TOKEN } from '../ports/embedder.service.interface';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(EMBEDDER_SERVICE_TOKEN)
    private readonly embedderService: IEmbedderService,
    private readonly qdrantService: QdrantService,
  ) {}

  async search(dto: SearchQueryDto): Promise<SearchResponseDto> {
    const startTime = Date.now();
    const limit = dto.limit || 50;
    // Standard industry minimum relevance threshold (35.0% Cosine Similarity)
    const minThreshold = typeof dto.minRelevanceScore === 'number' ? dto.minRelevanceScore : 35.0;

    this.logger.log(
      `Executing AI search query: "${dto.query}" (Sender: ${dto.sender || 'Any'}, Batch: ${dto.batchId || 'All'}, MinScore: ${minThreshold}%)`,
    );

    // 1. Generate 384-dim query vector
    const queryVector = await this.embedderService.generateEmbedding(dto.query);

    // 2. Perform Cosine vector search in Qdrant / Vector Index
    const rawResults = await this.qdrantService.searchVectors(
      queryVector,
      limit * 3,
      dto.sender,
      dto.batchId,
    );

    // 3. Map vector results & apply minRelevanceScore threshold
    let results: SearchResultItemDto[] = rawResults.map((hit) => {
      const relevanceScore = this.normalizeScore(hit.score);
      return {
        id: hit.id.toString(),
        telegramId: hit.payload.telegramId,
        timestamp: hit.payload.date,
        sender: hit.payload.sender,
        text: hit.payload.text,
        relevanceScore,
        batchId: hit.payload.batchId,
      };
    });

    // 4. Deduplicate identical messages
    const seenTexts = new Set<string>();
    results = results.filter((item) => {
      const key = `${item.sender}:${item.text.trim()}`;
      if (seenTexts.has(key)) return false;
      seenTexts.add(key);
      return true;
    });

    // 5. Filter out low-relevance items below threshold
    results = results.filter((r) => r.relevanceScore >= minThreshold);

    // 6. Apply Date Range filters if provided
    if (dto.startDate) {
      const startMs = new Date(dto.startDate).getTime();
      if (!isNaN(startMs)) {
        results = results.filter((r) => new Date(r.timestamp).getTime() >= startMs);
      }
    }

    if (dto.endDate) {
      const endMs = new Date(dto.endDate).getTime();
      if (!isNaN(endMs)) {
        results = results.filter((r) => new Date(r.timestamp).getTime() <= endMs);
      }
    }

    // Slice to requested limit
    results = results.slice(0, limit);

    const executionTimeMs = Date.now() - startTime;
    this.logger.log(
      `Returned ${results.length} filtered results for query "${dto.query}" in ${executionTimeMs}ms.`,
    );

    return {
      query: dto.query,
      totalResults: results.length,
      executionTimeMs,
      results,
    };
  }

  private normalizeScore(cosineScore: number): number {
    const percentage = Math.max(0, Math.min(100, cosineScore * 100));
    return parseFloat(percentage.toFixed(1));
  }
}
