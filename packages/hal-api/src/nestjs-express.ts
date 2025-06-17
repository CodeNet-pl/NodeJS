import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { withBaseUrl } from './hook';

export class HalLinksMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const baseUrl =
      (req.get('X-Forwarded-Proto') ?? req.protocol) +
      '://' +
      (req.get('X-Forwarded-Host') ?? req.get('host')) +
      (req.get('X-Forwarded-Prefix') ?? '/');

    // Assuming withBaseUrl is a function that sets the base URL in the request context
    withBaseUrl(baseUrl, next);
  }
}
