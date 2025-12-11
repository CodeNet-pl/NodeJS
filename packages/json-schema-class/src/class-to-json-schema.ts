import { JSONSchema7 } from 'json-schema';
import { ClassType } from './class-type';
import { JsonSchemaRegistry } from './json-schema-registry';

export function classToJsonSchema(target: ClassType): JSONSchema7 {
  if (typeof target !== 'function') {
    throw new Error(
      'Target must be a class constructor to convert to JSON Schema.'
    );
  }

  const result = JsonSchemaRegistry.getInstance().get(target);
  if (!result) {
    throw new Error(
      `No JSON Schema registered for class '${target.name}'. Did you forget to add the @JsonSchema decorator?`
    );
  }
  return result;
}
