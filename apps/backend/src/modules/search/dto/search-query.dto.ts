import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({
    example: 'Find messages mentioning drugs',
    description: 'Natural language search query',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({
    example: 20,
    required: false,
    description: 'Maximum number of search results to return (default 50)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiProperty({
    example: 'TraderJoe',
    required: false,
    description: 'Filter by specific sender handle',
  })
  @IsOptional()
  @IsString()
  sender?: string;

  @ApiProperty({
    example: 'a51315eb-4458-4cb8-8eee-5c4a25417dea',
    required: false,
    description: 'Filter by specific upload batch ID',
  })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiProperty({
    example: 70,
    required: false,
    description: 'Minimum relevance score percentage threshold (0-100%)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minRelevanceScore?: number;

  @ApiProperty({
    example: '2024-01-01',
    required: false,
    description: 'Start date filter (ISO string or YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31',
    required: false,
    description: 'End date filter (ISO string or YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
