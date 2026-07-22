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
    it('should parse valid Telegram Desktop JSON export', async () => {
      const sampleExport = {
        name: 'Darknet Intelligence Group',
        type: 'public_supergroup',
        id: 1234567,
        messages: [
          {
            id: 101,
            type: 'message',
            date: '2024-03-10T14:20:00',
            date_unixtime: 1710080400,
            from: 'TraderJoe',
            from_id: 'user101',
            text: 'We have pure MDMA and Cocaine available for shipping.',
          },
          {
            id: 102,
            type: 'message',
            date: '2024-03-10T14:25:00',
            date_unixtime: 1710080700,
            from: 'SecResearcher',
            text: [
              'New ransomware strain detected: ',
              { type: 'bold', text: 'LockBit 3.0' },
            ],
            reply_to_message_id: 101,
          },
          {
            id: 103,
            type: 'service', // Service message without text -> should be skipped
            actor: 'System',
          },
        ],
      };

      const filePath = path.join(testDir, 'sample_export.json');
      await fs.writeFile(filePath, JSON.stringify(sampleExport), 'utf-8');

      const result = await service.parseExportFile(filePath, 'sample_export.json');

      expect(result).toBeDefined();
      expect(result.channelName).toBe('Darknet Intelligence Group');
      expect(result.totalParsedMessages).toBe(2);
      expect(result.messages[0].sender).toBe('TraderJoe');
      expect(result.messages[0].text).toBe('We have pure MDMA and Cocaine available for shipping.');
      expect(result.messages[1].text).toBe('New ransomware strain detected: LockBit 3.0');
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
