import {
  Controller,
  Get,
  INestApplication,
  MiddlewareConsumer,
  Module,
  Param,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { resolveHref } from '../src';
import { HalLinksMiddleware } from '../src/nestjs-express';

@Controller('href')
class HrefController {
  // The URL can contain slashes
  @Get('*path')
  async get(@Param('path') path: string) {
    return resolveHref(path);
  }
}

@Module({
  imports: [],
  controllers: [HrefController],
  providers: [HalLinksMiddleware],
})
class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HalLinksMiddleware).forRoutes('*');
  }
}

let app: INestApplication | undefined;

beforeAll(async () => {
  const testing = Test.createTestingModule({
    imports: [AppModule],
  });
  const compiled = await testing.compile();
  app = compiled.createNestApplication();
  app.init();
});

afterAll(async () => {
  await app?.close();
});

it('should generate href as is', async () => {
  await request(app?.getHttpServer())
    .get('/href/foo')
    .expect(200)
    .expect((res) => {
      expect(res.text).toMatch(/http:\/\/127.0.0.1:\d+\/foo/);
    });
});

it('should generate href with Host', async () => {
  await request(app?.getHttpServer())
    .get('/href/foo')
    .set('X-Forwarded-Host', 'example.com')
    .expect(200)
    .expect('http://example.com/foo');
});

it('should generate href with Proto/Host', async () => {
  await request(app?.getHttpServer())
    .get('/href/foo')
    .set('X-Forwarded-Proto', 'https')
    .set('X-Forwarded-Host', 'example.com')
    .expect(200)
    .expect('https://example.com/foo');
});

it('should generate href with Proto/Host/Prefix', async () => {
  await request(app?.getHttpServer())
    .get('/href/foo')
    .set('X-Forwarded-Proto', 'https')
    .set('X-Forwarded-Host', 'example.com')
    .set('X-Forwarded-Prefix', '/api')
    .expect(200)
    .expect('https://example.com/api/foo');
});
