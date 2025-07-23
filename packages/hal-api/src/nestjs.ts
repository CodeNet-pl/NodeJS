import { HalLink } from '@code-net/hal';
import { RequestMethod, Type } from '@nestjs/common';
import {
  METHOD_METADATA,
  PATH_METADATA,
  ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants';
import 'reflect-metadata';
import { resolveLink } from './link';

type Stringifyable = string | number | { toString: () => string };

export type RouteOptions = {
  params: Record<string, Stringifyable | Stringifyable[]>;
  queryString?: string;
  title?: string;
} & Record<string, any>;

type RouteParameter = {
  name: string;
  type: any;
};

/**
 * Generates a link from a controller method.
 */
export function routeLink<TCtrl extends Type<any>>(
  ctrl: TCtrl,
  method: keyof TCtrl['prototype'],
  options?: RouteOptions
): HalLink | undefined;
export function routeLink<TCtrl>(
  ctrl: TCtrl,
  method: keyof TCtrl,
  options?: RouteOptions
): HalLink | undefined;
export function routeLink<TCtrl>(
  ctrl: TCtrl,
  method: keyof TCtrl,
  options?: RouteOptions
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
  // let bodyFromDecorator: () => unknown | undefined = () => undefined;
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
  const routeParameters: RouteParameter[] = [];

  for (const key of Object.keys(argsMeta).reverse()) {
    const [type, index] = key.split(':');
    if (type === '4' && argsMeta[key].data) {
      routeParameters.push({
        name: argsMeta[key].data,
        type: paramTypes[index],
      });
    }
    // if (type === '3' && !options?.body) {
    //   if (paramTypes && paramTypes[index]) {
    //     bodyFromDecorator = paramTypes[index];
    //   }
    // }
  }

  let { title, queryString, params, ...rest } = options ?? { params: {} };
  queryString = queryString ?? buildQueryString(routeParameters, params);

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
  return resolveLink({
    href,
    method: RequestMethod[methodRoute] as any,
    title,
    templated,
    ...rest,
  });
}

function buildQueryString(
  routeParameters: RouteParameter[],
  params: Record<string, { toString: () => string }>
) {
  if (routeParameters.length === 0) {
    return '';
  }
  const provided = routeParameters.reduce(
    (prev: string[], next: RouteParameter, index) => {
      if (params && params[next.name]) {
        if (next.type === Array) {
          (params[next.name] as string[]).forEach((val) => {
            prev.push(`${next.name}[]=${encodeURIComponent(val)}`);
          });
        } else {
          prev.push(
            `${next.name}=${encodeURIComponent(params[next.name] as string)}`
          );
        }
      }
      return prev;
    },
    []
  );

  if (provided.length > 0) {
    const templatedParams = routeParameters.filter((p) => !params[p.name]);
    if (templatedParams.length === 0) {
      return `?${provided.join('&')}`;
    }
    return `?${provided.join('&')}{&${templatedParams
      .map((p) => p.name)
      .join(',')}}`;
  } else {
    return `{?${routeParameters.map((p) => p.name).join(',')}}`;
  }
}
