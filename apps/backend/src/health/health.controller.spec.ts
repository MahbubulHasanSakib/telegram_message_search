import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe('checkHealth', () => {
    it('should return health status ok', () => {
      const response = healthController.checkHealth();
      expect(response.status).toBe('ok');
      expect(response.service).toBe('telegram-message-search-backend');
      expect(response.version).toBe('1.0.0');
      expect(response.timestamp).toBeDefined();
    });
  });
});
