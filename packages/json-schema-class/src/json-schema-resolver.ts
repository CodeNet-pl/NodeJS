import { JSONSchema7 } from 'json-schema';
import { ClassType } from './class-type';
import { JsonSchemaRegistry } from './json-schema-registry';

export class JsonSchemaResolver {
  constructor(
    private urlGenerator: (name: string) => string,
    private registry: JsonSchemaRegistry = JsonSchemaRegistry.getInstance()
  ) {}

  schemaId(nameOrClass: string | ClassType): string {
    return this.urlGenerator(
      typeof nameOrClass === 'function' ? nameOrClass.name : nameOrClass
    );
  }

  hasSchema(schema: string | ClassType): boolean {
    return this.registry.contains(this.schemaId(schema));
  }

  schema(schemaId: string | ClassType): JSONSchema7 {
    if (!this.registry.contains(schemaId)) {
      throw new Error('Schema not found');
    }

    const schema = this.registry.get(schemaId);
    if (!schema) {
      throw new Error(`Schema with id '${schemaId}' not found.`);
    }
    return this.replaceSchemaId(schema);
  }

  private replaceSchemaId(schema: JSONSchema7): JSONSchema7 {
    const newSchema: JSONSchema7 = { ...schema };
    if (newSchema.$id) {
      newSchema.$id = this.schemaId(newSchema.$id);
    }
    if (newSchema.$ref) {
      newSchema.$ref = this.schemaId(newSchema.$ref);
    }
    if (newSchema.items) {
      if (Array.isArray(newSchema.items)) {
        newSchema.items = newSchema.items.map((item) =>
          typeof item === 'object' ? this.replaceSchemaId(item) : item
        );
      } else if (typeof newSchema.items === 'object') {
        newSchema.items = this.replaceSchemaId(newSchema.items);
      }
    }
    if (newSchema.properties) {
      for (const key in newSchema.properties) {
        if (typeof newSchema.properties[key] === 'object') {
          newSchema.properties[key] = this.replaceSchemaId(
            newSchema.properties[key]
          );
        }
      }
    }
    return newSchema;
  }

  all(): Record<string, JSONSchema7> {
    return this.registry
      .getKeys()
      .reduce<Record<string, JSONSchema7>>((acc, schemaId) => {
        acc[this.schemaId(schemaId)] = this.schema(schemaId);

        return acc;
      }, {});
  }

  /**
   * Returns JSON schema reference for the given schema ID.
   */
  schemaRef(schemaId: string | ClassType): JSONSchema7 {
    return { $ref: this.schemaId(schemaId) };
  }
}
