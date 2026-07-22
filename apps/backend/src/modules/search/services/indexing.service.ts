import { Injectable, Logger, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MessagesService } from '../../messages/messages.service';
import { QdrantService, QdrantVectorPoint } from './qdrant.service';
import { IEmbedderService, EMBEDDER_SERVICE_TOKEN } from '../ports/embedder.service.interface';

@Injectable()
export class IndexingService {
  private readonly logger = new Logger(IndexingService.name);

  constructor(
    private readonly messagesService: MessagesService,
    @Inject(EMBEDDER_SERVICE_TOKEN)
    private readonly embedderService: IEmbedderService,
    private readonly qdrantService: QdrantService,
  ) {}

  async parseAndIndexExport(filename: string) {
    this.logger.log(`Starting end-to-end parsing and AI indexing for file: ${filename}`);

    let batchId: string = randomUUID();

    // 1. Try persisting records to PostgreSQL database via Prisma
    try {
      const storedBatch = await this.messagesService.parseAndStoreExport(filename);
      batchId = String(storedBatch.batchId);
    } catch (dbError) {
      this.logger.warn(
        `Database storage notice: ${(dbError as Error).message}. Indexing vectors directly into Vector Engine.`,
      );
    }

    // 2. Parse Telegram export JSON
    const parseResult = await this.messagesService.parseExportFile(filename);

    const points: QdrantVectorPoint[] = [];
    const BATCH_SIZE = 32;

    // 3. Generate vector embeddings in batches & build Qdrant vector points
    for (let i = 0; i < parseResult.messages.length; i += BATCH_SIZE) {
      const chunk = parseResult.messages.slice(i, i + BATCH_SIZE);
      const enrichedTexts = chunk.map((msg) =>
        this.embedderService.enrichMessageText(msg.sender, msg.date, msg.text),
      );

      const embeddings = await this.embedderService.generateBatchEmbeddings(enrichedTexts);

      chunk.forEach((msg, idx) => {
        // Valid UUID string for Qdrant Cloud point ID compatibility
        const pointId = randomUUID();
        points.push({
          id: pointId,
          vector: embeddings[idx],
          payload: {
            messageId: pointId,
            telegramId: msg.telegramId,
            sender: msg.sender,
            date: msg.date.toISOString(),
            text: msg.text,
            batchId: batchId,
          },
        });
      });
    }

    // 4. Upsert point vectors into Qdrant Vector Index
    await this.qdrantService.upsertVectors(points);

    this.logger.log(
      `Successfully indexed batch ${batchId}: ${points.length} vectors stored in Vector Engine.`,
    );

    return {
      batchId,
      filename,
      totalMessagesIndexed: points.length,
      status: 'INDEXED',
    };
  }
}
