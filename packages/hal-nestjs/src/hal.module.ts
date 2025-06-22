import { JsonSchemaResolver } from '@code-net/json-schema-class';
import { DynamicModule, Module } from '@nestjs/common';
import { HalLinkBodyResolver, HalLinkGenerator } from './hal-link.generator';

export type HalModuleOptions = {
  bodyResolver: HalLinkBodyResolver;
};

/**
 * Resolves body from class.
 */
export class DefaultHalBodyResolver implements HalLinkBodyResolver {
  constructor(private readonly resolver: JsonSchemaResolver) {}

  resolve(body: unknown) {
    if (typeof body === 'function') {
      return this.resolver.schemaRef(body as any);
    }
    return body as any;
  }
}

@Module({})
export class HalModule {
  public static register(options: HalModuleOptions): DynamicModule {
    return {
      module: HalModule,
      providers: [
        {
          provide: HalLinkGenerator,
          useValue: new HalLinkGenerator(options.bodyResolver),
        },
      ],
      exports: [HalLinkGenerator],
    };
  }
}
