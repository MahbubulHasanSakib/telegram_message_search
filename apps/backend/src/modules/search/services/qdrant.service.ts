import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

export interface QdrantVectorPoint {
  id: string;
  vector: number[];
  payload: {
    messageId: string;
    telegramId: string;
    sender: string;
    date: string;
    text: string;
    batchId: string;
  };
}

export interface QdrantSearchResult {
  id: string | number;
  score: number;
  payload: {
    messageId: string;
    telegramId: string;
    sender: string;
    date: string;
    text: string;
    batchId: string;
  };
}

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private client?: QdrantClient;
  private readonly collectionName = 'telegram_messages';
  private readonly vectorSize = 384;
  private readonly localMemoryStore = new Map<string, QdrantVectorPoint>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const qdrantUrl = this.configService.get<string>('QDRANT_URL');
    const qdrantApiKey = this.configService.get<string>('QDRANT_API_KEY');

    if (qdrantUrl && qdrantApiKey && qdrantApiKey !== 'your-qdrant-api-key') {
      try {
        this.client = new QdrantClient({
          url: qdrantUrl,
          apiKey: qdrantApiKey,
        });
        await this.ensureCollectionExists();
        this.logger.log('Connected to Qdrant Cloud Vector Database.');
      } catch (error) {
        this.logger.warn(`Failed to connect to Qdrant Cloud: ${(error as Error).message}. Utilizing local vector store.`);
      }
    } else {
      this.logger.log('Qdrant Cloud credentials not present. Utilizing high-performance local vector store.');
    }
  }

  private async ensureCollectionExists(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some((c) => c.name === this.collectionName);

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine',
          },
        });
        this.logger.log(`Created Qdrant collection '${this.collectionName}' with 384 Cosine vectors.`);
      }
    } catch (error) {
      this.logger.warn(`Failed to connect to Qdrant Cloud: ${(error as Error).message}. Falling back to local vector store.`);
      this.client = undefined;
    }
  }

  async upsertVectors(points: QdrantVectorPoint[]): Promise<void> {
    if (points.length === 0) return;

    if (this.client) {
      try {
        await this.ensureCollectionExists();
        await this.client.upsert(this.collectionName, {
          wait: true,
          points: points.map((p) => ({
            id: p.id,
            vector: p.vector,
            payload: p.payload,
          })),
        });
        this.logger.log(`Upserted ${points.length} vector points to Qdrant Cloud.`);
        return;
      } catch (error) {
        this.logger.warn(`Qdrant Cloud upsert failed: ${error}. Saving to local vector store.`);
      }
    }

    // Local Memory Vector Store Upsert Fallback
    for (const point of points) {
      this.localMemoryStore.set(point.id, point);
    }
    this.logger.log(`Upserted ${points.length} vector points to Local Memory Vector Store.`);
  }

  async searchVectors(
    queryVector: number[],
    limit: number = 50,
    filterSender?: string,
    filterBatchId?: string,
  ): Promise<QdrantSearchResult[]> {
    if (this.client) {
      try {
        await this.ensureCollectionExists();
        const mustFilters: any[] = [];
        if (filterSender) {
          mustFilters.push({
            key: 'sender',
            match: { value: filterSender },
          });
        }
        if (filterBatchId) {
          mustFilters.push({
            key: 'batchId',
            match: { value: filterBatchId },
          });
        }

        const results = await this.client.search(this.collectionName, {
          vector: queryVector,
          limit,
          filter: mustFilters.length > 0 ? { must: mustFilters } : undefined,
          with_payload: true,
        });

        return results.map((res) => ({
          id: res.id,
          score: res.score,
          payload: res.payload as QdrantSearchResult['payload'],
        }));
      } catch (error) {
        this.logger.warn(`Qdrant Cloud search failed: ${error}. Querying local vector store.`);
      }
    }

    // Local Vector Search Fallback (Cosine Similarity Calculation)
    const results: QdrantSearchResult[] = [];

    for (const point of this.localMemoryStore.values()) {
      if (filterSender && point.payload.sender !== filterSender) {
        continue;
      }
      if (filterBatchId && point.payload.batchId !== filterBatchId) {
        continue;
      }

      const score = this.calculateCosineSimilarity(queryVector, point.vector);
      results.push({
        id: point.id,
        score,
        payload: point.payload,
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dotProduct / denom;
  }
}
