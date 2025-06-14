import {
  Format,
  Items,
  JsonSchema,
  Min,
  Optional,
  Required,
} from '@code-net/json-schema-class';
import {
  Body,
  Controller,
  INestApplication,
  Module,
  Post,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JsonSchemaValidationPipe } from '../src';

@JsonSchema()
class SchemaTestDto {
  @Required()
  @Min(0)
  id!: number;

  @Required()
  str!: string;

  @Required()
  @Items('string')
  array!: string[];

  @Optional()
  @Format('date-time')
  date?: string;
}

@Controller('schema-test')
class TestController {
  @Post()
  async post(
    @Body(new JsonSchemaValidationPipe()) dto: SchemaTestDto
  ): Promise<SchemaTestDto> {
    return dto;
  }

  @Post('other')
  async other() {
    return { message: 'This endpoint is not validated' };
  }
}

@Module({
  controllers: [TestController],
})
class TestModule {}

let app: INestApplication;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [TestModule],
  }).compile();
  app = module.createNestApplication();
  await app.init();
}, 30000);

afterAll(async () => {
  await app.close();
});

test(`should accept valid payload`, async () => {
  await request(app.getHttpServer())
    .post(`/schema-test`)
    .send({
      id: 123,
      str: 'test',
      array: ['one', 'two'],
      date: new Date().toISOString(),
    })
    .expect(201);
});

test('should reject missing required prop', async () => {
  await request(app.getHttpServer())
    .post(`/schema-test`)
    .send({
      str: 'test',
      array: ['one', 'two'],
      date: new Date().toISOString(),
    })
    .expect(400)
    .expect((res) => {
      expect(res.body).toEqual({
        error: 'Bad Request',
        statusCode: 400,
        message: `data should have required property 'id'`,
      });
    });
});

test('optional property can be missing', async () => {
  await request(app.getHttpServer())
    .post(`/schema-test`)
    .send({
      id: 123,
      str: 'test',
      array: ['one', 'two'],
    })
    .expect(201);
});

test('does not accept invalid date-time format', async () => {
  await request(app.getHttpServer())
    .post(`/schema-test`)
    .send({
      id: 123,
      str: 'test',
      array: ['one', 'two'],
      date: 'invalid-date', // invalid date-time
    })
    .expect(400)
    .expect((res) => {
      expect(res.body).toEqual({
        error: 'Bad Request',
        statusCode: 400,
        message: `data.date should match format "date-time"`,
      });
    });
});

test('does not accept invalid array items', async () => {
  await request(app.getHttpServer())
    .post(`/schema-test`)
    .send({
      id: 123,
      str: 'test',
      array: ['one', 2], // invalid item in array
      date: new Date().toISOString(),
    })
    .expect(400)
    .expect((res) => {
      expect(res.body).toEqual({
        error: 'Bad Request',
        statusCode: 400,
        message: `data.array[1] should be string`,
      });
    });
});

test('does not accept empty body', async () => {
  await request(app.getHttpServer())
    .post(`/schema-test`)
    .expect(400)
    .expect((res) => {
      expect(res.body).toEqual({
        error: 'Bad Request',
        statusCode: 400,
        message: `data should be object`,
      });
    });
});

test('does not validate other endpoints', async () => {
  await request(app.getHttpServer())
    .post(`/schema-test/other`)
    .send({
      id: 123,
      str: 'test',
      array: ['one', 'two'],
      date: new Date().toISOString(),
    })
    .expect(201);
});
