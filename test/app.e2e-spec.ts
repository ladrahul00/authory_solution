import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { forwardRef, INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Main.initialize();

    const moduleFixture = await Test.createTestingModule({
      imports: [forwardRef(() => AppModule)],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/ping')
      .expect(200)
      .expect('Hello World!');
  });
});
