import { ApiProperty } from '@nestjs/swagger';

export class UploadExportResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', description: 'Unique identifier for the uploaded file' })
  fileId: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479.json', description: 'Saved filename on server disk' })
  filename: string;

  @ApiProperty({ example: 'result.json', description: 'Original uploaded filename' })
  originalName: string;

  @ApiProperty({ example: 1048576, description: 'File size in bytes' })
  size: number;

  @ApiProperty({ example: 'application/json', description: 'MIME type of the file' })
  mimeType: string;

  @ApiProperty({ example: 'UPLOADED', description: 'Current upload status' })
  status: 'UPLOADED' | 'PARSED' | 'FAILED';

  @ApiProperty({ example: '2026-07-22T16:25:00.000Z', description: 'Upload timestamp' })
  createdAt: string;
}
