import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { MessagesService, StoredExportBatchDto } from './messages.service';
import { UploadExportResponseDto } from './dto/upload-export-response.dto';
import { ParseJsonFilePipe } from './pipes/parse-json-file.pipe';
import { ParseExportResultDto } from './domain/telegram-message.domain';

const uploadStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    callback(null, `${uniqueSuffix}${ext}`);
  },
});

@ApiTags('Telegram Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: uploadStorage,
      limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB max limit
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload Telegram JSON export file',
    description:
      'Upload a Telegram export JSON file (from Telegram Desktop result.json or tg-export tool) for processing and AI semantic indexing.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Telegram JSON export file (.json)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File successfully uploaded and ready for parsing',
    type: UploadExportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or missing file payload',
  })
  async uploadFile(
    @UploadedFile(new ParseJsonFilePipe()) file: Express.Multer.File,
  ): Promise<UploadExportResponseDto> {
    return this.messagesService.handleFileUpload(file);
  }

  @Post('parse/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Parse uploaded Telegram JSON export',
    description: 'Extracts, normalizes, and validates messages from an uploaded export file.',
  })
  @ApiParam({ name: 'filename', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479.json' })
  @ApiResponse({
    status: 200,
    description: 'Export file parsed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Export file not found',
  })
  async parseExport(@Param('filename') filename: string): Promise<ParseExportResultDto> {
    return this.messagesService.parseExportFile(filename);
  }

  @Post('store/:filename')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Parse and store Telegram messages into PostgreSQL database',
    description: 'Parses the uploaded JSON file and persists all messages into Neon PostgreSQL via Prisma.',
  })
  @ApiParam({ name: 'filename', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479.json' })
  @ApiResponse({
    status: 201,
    description: 'Messages parsed and persisted into database successfully',
  })
  async storeExport(@Param('filename') filename: string): Promise<StoredExportBatchDto> {
    return this.messagesService.parseAndStoreExport(filename);
  }
}
