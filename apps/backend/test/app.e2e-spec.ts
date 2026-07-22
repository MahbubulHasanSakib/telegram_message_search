import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AppModule } from '../src/app.module';

describe('Telegram Message Search E2E Workflow', () => {
  let app: INestApplication;
  const testUploadDir = path.resolve('./uploads');

  beforeAll(async () => {
    await fs.mkdir(testUploadDir, { recursive: true });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health should return 200 OK', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('telegram-message-search-backend');
      });
  });

  it('POST /api/v1/search should return valid response for query', () => {
    return request(app.getHttpServer())
      .post('/api/v1/search')
      .send({ query: 'Find messages mentioning drugs', limit: 5 })
      .expect(200)
      .expect((res) => {
        expect(res.body.query).toBe('Find messages mentioning drugs');
        expect(Array.isArray(res.body.results)).toBe(true);
        expect(typeof res.body.executionTimeMs).toBe('number');
      });
  });
});
