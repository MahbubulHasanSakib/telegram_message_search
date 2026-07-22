import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'API Root Endpoint' })
  @ApiResponse({ status: 200, description: 'Application info and API endpoints' })
  getRoot() {
    return {
      name: 'AI Telegram Message Search API',
      version: '1.0.0',
      status: 'operational',
      documentation: 'http://localhost:4000/api/docs',
      healthCheck: 'http://localhost:4000/api/v1/health',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check NestJS Backend Health Status' })
  @ApiResponse({ status: 200, description: 'Application is operational' })
  checkHealth() {
    return {
      status: 'ok',
      service: 'telegram-message-search-backend',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
