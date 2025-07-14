import { NextFunction, Request, Response } from 'express';
import { withBaseUrl } from './hook';

export const halLinks =
  (options?: { protocol?: 'http' | 'https'; host?: string; prefix?: string }) =>
  (req: Request, res: Response, next: NextFunction) => {
    withBaseUrl(
      (options?.protocol ?? req.get('X-Forwarded-Proto') ?? req.protocol) +
        '://' +
        (options?.host ?? req.get('X-Forwarded-Host') ?? req.get('host')) +
        (options?.prefix ?? req.get('X-Forwarded-Prefix') ?? '/'),
      next
    );
  };
