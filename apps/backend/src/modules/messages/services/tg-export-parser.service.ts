import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { ParsedTelegramMessage, ParseExportResultDto } from '../domain/telegram-message.domain';
import { TgExportJsonSchema, RawTgMessage, RawTextEntity } from '../schemas/tg-export.schema';

@Injectable()
export class TgExportParserService {
  private readonly logger = new Logger(TgExportParserService.name);

  async parseExportFile(filePath: string, fileId: string): Promise<ParseExportResultDto> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const rawJson = JSON.parse(fileContent);

      const parsedJson = TgExportJsonSchema.safeParse(rawJson);
      if (!parsedJson.success) {
        this.logger.error(`Zod validation failed for file ${fileId}: ${parsedJson.error.message}`);
        throw new BadRequestException(`Invalid Telegram JSON structure: ${parsedJson.error.issues[0]?.message}`);
      }

      const { name: channelName, messages: rawMessages } = parsedJson.data;

      const parsedMessages: ParsedTelegramMessage[] = [];

      for (const rawMsg of rawMessages) {
        // Skip service messages without text or non-message types
        if (rawMsg.type && rawMsg.type !== 'message' && !rawMsg.text) {
          continue;
        }

        const normalizedText = this.normalizeText(rawMsg.text);
        if (!normalizedText || normalizedText.trim().length === 0) {
          continue; // Skip messages with empty text (e.g. sticker only / photo without caption)
        }

        const sender = this.normalizeSender(rawMsg);
        const date = this.parseDate(rawMsg.date, rawMsg.date_unixtime);

        parsedMessages.push({
          telegramId: String(rawMsg.id),
          date,
          sender,
          text: normalizedText,
          replyToMessageId: rawMsg.reply_to_message_id ? String(rawMsg.reply_to_message_id) : undefined,
        });
      }

      this.logger.log(
        `Successfully parsed file ${fileId}: ${parsedMessages.length} valid messages extracted from channel '${channelName || 'Unknown Channel'}'.`,
      );

      return {
        fileId,
        channelName,
        totalParsedMessages: parsedMessages.length,
        messages: parsedMessages,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error reading/parsing Telegram export file ${filePath}: ${error}`);
      throw new BadRequestException(`Failed to parse Telegram export JSON: ${(error as Error).message}`);
    }
  }

  normalizeText(textObj?: string | RawTextEntity[]): string {
    if (!textObj) return '';
    if (typeof textObj === 'string') return textObj.trim();

    if (Array.isArray(textObj)) {
      return textObj
        .map((entity) => {
          if (typeof entity === 'string') return entity;
          if (typeof entity === 'object' && entity !== null && typeof entity.text === 'string') {
            return entity.text;
          }
          return '';
        })
        .join('')
        .trim();
    }

    return '';
  }

  normalizeSender(msg: RawTgMessage): string {
    if (msg.from && msg.from.trim().length > 0) return msg.from.trim();
    if (msg.actor && msg.actor.trim().length > 0) return msg.actor.trim();
    if (msg.from_id) return `user_${msg.from_id}`;
    if (msg.actor_id) return `user_${msg.actor_id}`;
    return 'Unknown Sender';
  }

  parseDate(dateStr?: string, unixTime?: number | string): Date {
    if (unixTime) {
      const timestamp = typeof unixTime === 'string' ? parseInt(unixTime, 10) : unixTime;
      if (!isNaN(timestamp)) {
        return new Date(timestamp * 1000);
      }
    }
    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    return new Date();
  }
}
