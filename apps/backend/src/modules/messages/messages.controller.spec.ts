import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TgExportParserService } from './services/tg-export-parser.service';
import { ParseJsonFilePipe } from './pipes/parse-json-file.pipe';
import { PrismaService } from '../database/prisma.service';

describe('MessagesController & File Upload Logic', () => {
  let controller: MessagesController;
  let pipe: ParseJsonFilePipe;

  const mockPrismaService = {
    exportBatch: { create: jest.fn(), update: jest.fn() },
    message: { createMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        MessagesService,
        TgExportParserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    pipe = new ParseJsonFilePipe();
  });

  describe('ParseJsonFilePipe', () => {
    it('should pass valid JSON export files', () => {
      const validFile = {
        originalname: 'result.json',
        mimetype: 'application/json',
        size: 5000,
      } as Express.Multer.File;

      expect(pipe.transform(validFile)).toBe(validFile);
    });

    it('should throw BadRequestException when no file is provided', () => {
      expect(() => pipe.transform(null as unknown as Express.Multer.File)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-JSON file extension', () => {
      const txtFile = {
        originalname: 'notes.txt',
        mimetype: 'text/plain',
        size: 2000,
      } as Express.Multer.File;

      expect(() => pipe.transform(txtFile)).toThrow(BadRequestException);
    });
  });

  describe('MessagesController.uploadFile', () => {
    it('should successfully upload valid file and return upload response DTO', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'telegram_export.json',
        encoding: '7bit',
        mimetype: 'application/json',
        size: 1048576,
        destination: './uploads',
        filename: 'abc-123-uuid.json',
        path: './uploads/abc-123-uuid.json',
        buffer: Buffer.from('{}'),
        stream: null as any,
      };

      const result = await controller.uploadFile(mockFile);

      expect(result).toBeDefined();
      expect(result.originalName).toBe('telegram_export.json');
      expect(result.status).toBe('UPLOADED');
      expect(result.fileId).toBeDefined();
      expect(result.size).toBe(1048576);
    });
  });
});
