export * from './json-schema-registry';
export * from './json-schema-resolver';
export * from './json-schema.decorator';
import {
  AllOf,
  AnyOf,
  ContentMediaType,
  CustomSchema,
  Default,
  Deprecated,
  Description,
  Format,
  Items,
  Max,
  MaxLength,
  Min,
  MinLength,
  Not,
  OneOf,
  Optional,
  Pattern,
  Required,
  Title,
  Type,
} from 'ts-decorator-json-schema-generator';
const Enum =
  (values: string[] | Record<string, string>) =>
  (target: any, propertyKey: string) => {
    if (Array.isArray(values)) {
      CustomSchema('enum', values)(target, propertyKey);
    } else {
      OneOf(
        Object.keys(values).map((key) => ({ const: key, title: values[key] }))
      )(target, propertyKey);
      Type('string')(target, propertyKey);
    }
  };

export {
  AllOf,
  AnyOf,
  ContentMediaType,
  CustomSchema,
  Default,
  Deprecated,
  Description,
  Enum,
  Format,
  Items,
  Max,
  MaxLength,
  Min,
  MinLength,
  Not,
  OneOf,
  Optional,
  Pattern,
  Required,
  Title,
  Type,
};
