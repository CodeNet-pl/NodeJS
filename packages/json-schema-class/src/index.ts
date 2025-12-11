export * from './class-to-json-schema';
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
  MaxItems,
  MaxLength,
  Min,
  MinItems,
  MinLength,
  Not,
  OneOf,
  Optional,
  Pattern,
  ReadOnly,
  Required,
  Title,
  Type,
} from 'ts-decorator-json-schema-generator';

const Enum =
  (values: string[] | Record<string, string>): PropertyDecorator =>
  (target, propertyKey) => {
    if (Array.isArray(values)) {
      CustomSchema('enum', values)(target, String(propertyKey));
    } else {
      OneOf(
        Object.keys(values).map((key) => ({ const: key, title: values[key] }))
      )(target, String(propertyKey));
      Type('string')(target, String(propertyKey));
    }
  };

function Const(value: string | number | boolean): PropertyDecorator {
  return (target, propertyKey) => {
    CustomSchema('const', value)(target, String(propertyKey));
  };
}

export {
  AllOf,
  AnyOf,
  Const,
  ContentMediaType,
  CustomSchema,
  Default,
  Deprecated,
  Description,
  Enum,
  Format,
  Items,
  Max,
  MaxItems,
  MaxLength,
  Min,
  MinItems,
  MinLength,
  Not,
  OneOf,
  Optional,
  Pattern,
  ReadOnly,
  Required,
  Title,
  Type,
};
