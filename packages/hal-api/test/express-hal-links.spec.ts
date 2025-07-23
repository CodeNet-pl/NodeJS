import express, { Request, Response } from 'express';
import request from 'supertest';
import { halLinks } from '../src/express';
import { resolveHref } from '../src/hook';

const app = express();
let server: any;
beforeAll(async () => {
  app.get('/href/*path', halLinks(), (req: Request, res: Response) => {
    res.send(resolveHref(req.params['path']));
  });
  server = app.listen(0);
});

afterAll(async () => {
  await server?.close();
});

it('should generate href as is', async () => {
  await request(app)
    .get('/href/foo')
    .expect(200)
    .expect((res) => {
      expect(res.text).toMatch(/http:\/\/127.0.0.1:\d+\/foo/);
    });
});

it('should generate href with Host', async () => {
  await request(app)
    .get('/href/foo')
    .set('X-Forwarded-Host', 'example.com')
    .expect(200)
    .expect('http://example.com/foo');
});

it('should generate href with Proto/Host', async () => {
  await request(app)
    .get('/href/foo')
    .set('X-Forwarded-Proto', 'https')
    .set('X-Forwarded-Host', 'example.com')
    .expect(200)
    .expect('https://example.com/foo');
});

it('should generate href with Proto/Host/Prefix', async () => {
  await request(app)
    .get('/href/foo')
    .set('X-Forwarded-Proto', 'https')
    .set('X-Forwarded-Host', 'example.com')
    .set('X-Forwarded-Prefix', '/api')
    .expect(200)
    .expect('https://example.com/api/foo');
});
