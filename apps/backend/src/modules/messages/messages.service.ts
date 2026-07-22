import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { UploadExportResponseDto } from './dto/upload-export-response.dto';
import { TgExportParserService } from './services/tg-export-parser.service';
import { ParseExportResultDto, ParsedTelegramMessage } from './domain/telegram-message.domain';
import { PrismaService } from '../database/prisma.service';

export interface StoredExportBatchDto {
  batchId: string;
  filename: string;
  channelName?: string;
  messageCount: number;
  status: string;
  createdAt: Date;
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly parserService: TgExportParserService,
    private readonly prisma: PrismaService,
  ) {}

  async handleFileUpload(file: Express.Multer.File): Promise<UploadExportResponseDto> {
    const fileId = randomUUID();

    this.logger.log(
      `File uploaded successfully: ${file.originalname} (${file.size} bytes) -> Saved as ${file.filename || fileId}`,
    );

    return {
      fileId,
      filename: file.filename || `${fileId}.json`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      status: 'UPLOADED',
      createdAt: new Date().toISOString(),
    };
  }

  async parseExportFile(filename: string): Promise<ParseExportResultDto> {
    const uploadsDir = path.resolve('./uploads');
    const filePath = path.join(uploadsDir, filename);

    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundException(`Uploaded export file '${filename}' not found on server.`);
    }

    return this.parserService.parseExportFile(filePath, filename);
  }

  async storeExportMessages(
    filename: string,
    channelName: string | undefined,
    parsedMessages: ParsedTelegramMessage[],
  ): Promise<StoredExportBatchDto> {
    // 1. Create ExportBatch record
    const batch = await this.prisma.exportBatch.create({
      data: {
        filename,
        channelName,
        messageCount: parsedMessages.length,
        status: 'PROCESSING',
      },
    });

    // 2. Chunk messages into batches of 500 for bulk insert
    const CHUNK_SIZE = 500;
    for (let i = 0; i < parsedMessages.length; i += CHUNK_SIZE) {
      const chunk = parsedMessages.slice(i, i + CHUNK_SIZE);
      await this.prisma.message.createMany({
        data: chunk.map((msg) => ({
          telegramId: msg.telegramId,
          date: msg.date,
          sender: msg.sender,
          text: msg.text,
          replyToId: msg.replyToMessageId,
          batchId: batch.id,
        })),
      });
    }

    // 3. Update status to COMPLETED
    const updatedBatch = await this.prisma.exportBatch.update({
      where: { id: batch.id },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(
      `Successfully persisted batch ${batch.id}: ${parsedMessages.length} messages saved in PostgreSQL.`,
    );

    return {
      batchId: updatedBatch.id,
      filename: updatedBatch.filename,
      channelName: updatedBatch.channelName || undefined,
      messageCount: updatedBatch.messageCount,
      status: updatedBatch.status,
      createdAt: updatedBatch.createdAt,
    };
  }

  async parseAndStoreExport(filename: string): Promise<StoredExportBatchDto> {
    const parseResult = await this.parseExportFile(filename);
    return this.storeExportMessages(
      filename,
      parseResult.channelName,
      parseResult.messages,
    );
  }
}
