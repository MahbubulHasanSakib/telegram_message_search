import { ApiProperty } from '@nestjs/swagger';

export class SearchResultItemDto {
  @ApiProperty({ example: 'msg-uuid-123', description: 'Internal message database ID' })
  id: string;

  @ApiProperty({ example: '101', description: 'Original Telegram message ID' })
  telegramId: string;

  @ApiProperty({ example: '2024-03-10T14:20:00.000Z', description: 'Timestamp when message was posted' })
  timestamp: string;

  @ApiProperty({ example: 'TraderJoe', description: 'Sender handle or username' })
  sender: string;

  @ApiProperty({ example: 'We have pure MDMA and Cocaine available for shipping.', description: 'Raw message content text' })
  text: string;

  @ApiProperty({ example: 94.5, description: 'Semantic relevance score percentage (0-100%)' })
  relevanceScore: number;

  @ApiProperty({ example: 'batch-uuid-456', description: 'Export batch ID' })
  batchId: string;
}

export class SearchResponseDto {
  @ApiProperty({ example: 'Find messages mentioning drugs', description: 'Executed search query' })
  query: string;

  @ApiProperty({ example: 5, description: 'Total number of relevant matches returned' })
  totalResults: number;

  @ApiProperty({ example: 45, description: 'Search execution latency in milliseconds' })
  executionTimeMs: number;

  @ApiProperty({ type: [SearchResultItemDto], description: 'List of ranked search results' })
  results: SearchResultItemDto[];
}
