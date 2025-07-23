import {
  Controller,
  Get,
  INestApplication,
  MiddlewareConsumer,
  Module,
  Post,
  Query,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { halLinks } from '../src/express';
import { routeLink } from '../src/nestjs';

class TestQueryDto {
  foo!: string;
  bar!: string[];
}

@Controller('hal')
class HalController {
  // The URL can contain slashes
  @Get()
  async get() {
    return {
      _links: {
        postTemplated: routeLink(this, 'post'),
        postResolved: routeLink(this, 'post', {
          params: { id: 123, foo: 'bar', bar: ['baz', 'qux'] },
        }),
        postObjTemplated: routeLink(this, 'postObj'),
        postObjResolved: routeLink(this, 'postObj', {
          params: { id: 123, foo: 'bar', bar: ['baz', 'qux'] },
        }),
      },
    };
  }

  @Post(':id/post')
  async post(@Query('foo') foo: string, @Query('bar') bar: string[]) {
    return undefined;
  }

  @Post(':id/post-object')
  async postObj(@Query() obj: TestQueryDto) {
    return undefined;
  }
}

@Module({
  controllers: [HalController],
})
class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(halLinks({})).forRoutes('*');
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
    .get('/hal')
    .expect(200)
    .expect((res) => {
      expect(res.body._links).toEqual({
        postTemplated: {
          href: expect.stringContaining('/hal/{id}/post{?foo,bar}'),
          method: 'POST',
          templated: true,
        },
        postResolved: {
          href: expect.stringContaining(
            '/hal/123/post?foo=bar&bar[]=baz&bar[]=qux'
          ),
          method: 'POST',
        },
        postObjTemplated: {
          href: expect.stringContaining('/hal/{id}/post-object{?foo,bar}'),
          method: 'POST',
          templated: true,
        },
        postObjResolved: {
          href: expect.stringContaining(
            '/hal/123/post-object?foo=bar&bar[]=baz&bar[]=qux'
          ),
          method: 'POST',
        },
      });
    });
});
