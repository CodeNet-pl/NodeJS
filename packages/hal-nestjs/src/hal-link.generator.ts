import { HalLink } from '@code-net/hal';
import { resolveHref } from '@code-net/hal-api';
import { RequestMethod, Type } from '@nestjs/common';
import {
  METHOD_METADATA,
  PATH_METADATA,
  ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants';
import 'reflect-metadata';

/**
 * Interface for resolving the body of a HAL link.
 */
export interface HalLinkBodyResolver {
  resolve(body: unknown): any;
}

export class HalLinkGenerator {
  constructor(private bodyResolver: HalLinkBodyResolver) {}

  /**
   * Generates a link from a controller method.
   */
  fromRoute<TCtrl extends Type<any>>(
    ctrl: TCtrl,
    method: keyof TCtrl['prototype'],
    params?: Record<string, { toString: () => string } | undefined>,
    options?: {
      queryString?: string;
      title?: string;
      body?: any;
    } & Record<string, any>
  ): HalLink | undefined;
  fromRoute<TCtrl>(
    ctrl: TCtrl,
    method: keyof TCtrl,
    params?: Record<string, { toString: () => string } | undefined>,
    options?: {
      queryString?: string;
      title?: string;
      body?: any;
    } & Record<string, any>
  ): HalLink | undefined;
  fromRoute<TCtrl>(
    ctrl: TCtrl,
    method: keyof TCtrl,
    params: Record<string, { toString: () => string }> = {},
    options?: {
      queryString?: string;
      title?: string;
      body?: any;
    } & Record<string, any>
  ): HalLink | undefined {
    if (!ctrl) {
      throw new Error(
        'Cannot generate link from route: controller is not defined'
      );
    }
    let paramTypes: any;
    // let returnType: any;
    let ctrlRoute: string;
    let pathRoute: string;
    let methodRoute: RequestMethod;
    let argsMeta: Record<string, any> = {};
    let templated = undefined;
    let bodyFromDecorator: () => unknown | undefined = () => undefined;
    if (typeof ctrl === 'function') {
      if (!ctrl.prototype[method]) {
        return undefined;
      }
      paramTypes = Reflect.getMetadata(
        'design:paramtypes',
        ctrl.prototype,
        method as any
      );
      // returnType = Reflect.getMetadata('schema:returntype', ctrl.prototype, method as any);
      ctrlRoute = Reflect.getOwnMetadata(PATH_METADATA, ctrl);
      pathRoute = Reflect.getOwnMetadata(PATH_METADATA, ctrl.prototype[method]);
      methodRoute = Reflect.getOwnMetadata(
        METHOD_METADATA,
        ctrl.prototype[method]
      );
      argsMeta =
        Reflect.getMetadata(ROUTE_ARGS_METADATA, ctrl, method as any) ?? {};
    } else {
      if (!ctrl[method]) {
        return undefined;
      }
      paramTypes = ctrl
        ? Reflect.getMetadata('design:paramtypes', ctrl, method as any)
        : undefined;
      // returnType = ctrl ? Reflect.getMetadata('schema:returntype', ctrl, method as any) : undefined;
      ctrlRoute = Reflect.getOwnMetadata(PATH_METADATA, ctrl.constructor);
      pathRoute = Reflect.getOwnMetadata(PATH_METADATA, ctrl[method]);
      methodRoute = Reflect.getOwnMetadata(METHOD_METADATA, ctrl[method]);
      argsMeta =
        Reflect.getMetadata(
          ROUTE_ARGS_METADATA,
          ctrl.constructor,
          method as any
        ) ?? {};
    }
    const path = `${ctrlRoute}/${pathRoute.replace(/^\//, '')}`.replace(
      /\/$/,
      ''
    );
    const routeParameters = [];

    for (const key of Object.keys(argsMeta).reverse()) {
      const [type, index] = key.split(':');
      if (type === '4' && argsMeta[key].data) {
        routeParameters.push(argsMeta[key].data);
      }
      if (type === '3' && !options?.body) {
        if (paramTypes && paramTypes[index]) {
          bodyFromDecorator = paramTypes[index];
        }
      }
    }

    let { title, body, queryString, ...rest } = options ?? {};
    queryString = queryString ?? this.buildQueryString(routeParameters, params);
    body = this.bodyResolver
      ? this.bodyResolver.resolve(body ?? bodyFromDecorator)
      : body;
    const pathWithQuery = `${path}${queryString ?? ''}`;
    const href = pathWithQuery.replace(
      /:(\w+)/g,
      (match: string, key: string) => {
        return params[key]?.toString() ?? `{${key}}`;
      }
    );
    if (href.includes('{')) {
      templated = true;
    }
    return this.link({
      href,
      method: RequestMethod[methodRoute] as any,
      title,
      body,
      templated,
      ...rest,
    });
  }

  /**
   * Generates a link object with the given parameters.
   */
  link({ href, method, title, body, templated, ...other }: HalLink): any {
    return {
      href: resolveHref(href),
      method: method ?? 'GET',
      title,
      body,
      templated,
      ...other,
    };
  }

  private buildQueryString(
    routeParameters: string[],
    params: Record<string, { toString: () => string }>
  ) {
    if (routeParameters.length === 0) {
      return '';
    }
    const provided = routeParameters.reduce(
      (prev: string[], next: string, index) => {
        if (params && params[next]) {
          prev.push(`${next}=${encodeURIComponent(params[next] as string)}`);
        }
        return prev;
      },
      []
    );

    if (provided.length > 0) {
      const templatedParams = routeParameters.filter((p) => !params[p]);
      if (templatedParams.length === 0) {
        return `?${provided.join('&')}`;
      }
      return `?${provided.join('&')}{&${templatedParams.join(',')}}`;
    } else {
      return `{?${routeParameters.join(',')}}`;
    }
  }
}
