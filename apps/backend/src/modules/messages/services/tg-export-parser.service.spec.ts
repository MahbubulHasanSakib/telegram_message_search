import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TgExportParserService } from './tg-export-parser.service';

describe('TgExportParserService', () => {
  let service: TgExportParserService;
  const testDir = path.resolve('./test-fixtures');

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TgExportParserService],
    }).compile();

    service = module.get<TgExportParserService>(TgExportParserService);
  });

  describe('normalizeText', () => {
    it('should handle string text', () => {
      expect(service.normalizeText(' Hello Telegram ')).toBe('Hello Telegram');
    });

    it('should handle array of rich text entities', () => {
      const richText = [
        'Check out ',
        { type: 'bold', text: 'this malware sample' },
        ' at ',
        { type: 'link', text: 'http://example.com' },
      ];
      expect(service.normalizeText(richText)).toBe('Check out this malware sample at http://example.com');
    });

    it('should return empty string for missing or invalid text', () => {
      expect(service.normalizeText(undefined)).toBe('');
    });
  });

  describe('normalizeSender', () => {
    it('should extract from field if available', () => {
      expect(service.normalizeSender({ id: 1, from: 'Alice' })).toBe('Alice');
    });

    it('should extract actor field if from is missing', () => {
      expect(service.normalizeSender({ id: 2, actor: 'Bob Channel' })).toBe('Bob Channel');
    });

    it('should fallback to user_id if handles are missing', () => {
      expect(service.normalizeSender({ id: 3, from_id: 98765 })).toBe('user_98765');
    });

    it('should fallback to Unknown Sender if no information exists', () => {
      expect(service.normalizeSender({ id: 4 })).toBe('Unknown Sender');
    });
  });

  describe('parseExportFile', () => {
    it('should parse valid Telethon-generated JSON export', async () => {
      // Telethon script output format: object with name/type/id/messages and real from names
      const sampleExport = {
        name: 'IUC Data Science Research Group',
        type: 'group',
        id: 1234567,
        messages: [
          {
            id: 101,
            type: 'message',
            date: '2024-03-10T14:20:00+00:00',
            from: 'Mahbubul Hasan',
            text: 'Research meeting of IDSRG tomorrow at 12pm in AI Lab.',
          },
          {
            id: 102,
            type: 'message',
            date: '2024-03-10T14:25:00+00:00',
            from: 'Sakib Ahmed',
            text: 'Assalamu alaikum. Will attend the meeting.',
            reply_to_message_id: 101,
          },
          {
            id: 103,
            type: 'message',
            date: '2024-03-10T14:30:00+00:00',
            from: 'Ziaul Hoque',
            text: '', // Empty text - should be skipped
          },
        ],
      };

      const filePath = path.join(testDir, 'sample_export.json');
      await fs.writeFile(filePath, JSON.stringify(sampleExport), 'utf-8');

      const result = await service.parseExportFile(filePath, 'sample_export.json');

      expect(result).toBeDefined();
      expect(result.channelName).toBe('IUC Data Science Research Group');
      expect(result.totalParsedMessages).toBe(2); // empty text message is skipped
      expect(result.messages[0].sender).toBe('Mahbubul Hasan');
      expect(result.messages[0].text).toBe('Research meeting of IDSRG tomorrow at 12pm in AI Lab.');
      expect(result.messages[1].replyToMessageId).toBe('101');
    });

    it('should throw BadRequestException for invalid JSON structure', async () => {
      const invalidPath = path.join(testDir, 'non_existent.json');
      await expect(service.parseExportFile(invalidPath, 'non_existent.json')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
