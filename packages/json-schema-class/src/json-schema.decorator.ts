import { JsonSchema as OriginalJsonSchema } from 'ts-decorator-json-schema-generator';
import { JsonSchemaRegistry } from './json-schema-registry';

export function JsonSchema(options?: {
  id?: string;
  title?: string;
  description?: string;
  additionalProperties?: boolean;
}): ClassDecorator {
  return (target: any) => {
    const dtoName = target.name;
    JsonSchemaRegistry.getInstance().registerClass(target, options);

    return OriginalJsonSchema({
      ...options,
      id: dtoName,
    })(target);
  };
}
