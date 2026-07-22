import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SearchService } from './services/search.service';
import { IndexingService } from './services/indexing.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-result.dto';

@ApiTags('AI Search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly indexingService: IndexingService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute natural language AI search over Telegram messages',
    description:
      'Performs semantic similarity vector search across indexed messages for natural language queries like "Find messages mentioning drugs", "Find malware discussions", "Show suspicious messages".',
  })
  @ApiResponse({
    status: 200,
    description: 'Search query processed successfully returning ranked message results',
    type: SearchResponseDto,
  })
  async search(@Body() dto: SearchQueryDto): Promise<SearchResponseDto> {
    return this.searchService.search(dto);
  }

  @Post('index/:filename')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Parse, store, and generate vector embeddings for export file',
    description:
      'Parses the Telegram JSON export, saves records to PostgreSQL, and indexes dense vector embeddings into Qdrant Cloud.',
  })
  @ApiParam({ name: 'filename', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479.json' })
  @ApiResponse({
    status: 201,
    description: 'Export file indexed and vectors generated successfully',
  })
  async indexExport(@Param('filename') filename: string) {
    return this.indexingService.parseAndIndexExport(filename);
  }
}
