import { NextFunction, Request, Response } from 'express';
import { withBaseUrl } from './hook';

export function halLinks(req: Request, res: Response, next: NextFunction) {
  withBaseUrl(
    (req.get('X-Forwarded-Proto') ?? req.protocol) +
      '://' +
      (req.get('X-Forwarded-Host') ?? req.get('host')) +
      (req.get('X-Forwarded-Prefix') ?? '/'),
    next
  );
}
