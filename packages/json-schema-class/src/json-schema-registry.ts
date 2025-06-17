import { JSONSchema7 } from 'json-schema';
import { generateJsonSchema } from 'ts-decorator-json-schema-generator';
import { ClassType } from './class-type';

export class JsonSchemaRegistry {
  private static instance: JsonSchemaRegistry;

  private registry: Map<string, JSONSchema7>;

  constructor() {
    this.registry = new Map();
  }

  /**
   * Gets the global registry instance for classes registered via decorator.
   */
  public static getInstance(): JsonSchemaRegistry {
    if (!JsonSchemaRegistry.instance) {
      JsonSchemaRegistry.instance = new JsonSchemaRegistry();
    }

    return JsonSchemaRegistry.instance;
  }

  /***
   * Registers a class as a JSON Schema.
   */
  public registerClass(
    schemaClass: ClassType,
    options?: {
      title?: string;
      description?: string;
      additionalProperties?: boolean;
    }
  ) {
    const schemaName = schemaClass.name;

    if (this.registry.has(schemaName)) {
      throw new Error(
        `JSON Schema with name '${schemaName}' is already registered. Use a different name.`
      );
    }

    const schema = this.classToSchema(schemaClass);
    if (options?.title) {
      schema.title = options.title;
    }
    if (options?.description) {
      schema.description = options.description;
    }
    if (options?.additionalProperties !== undefined) {
      schema.additionalProperties = options.additionalProperties;
    }
    this.registerSchema(schema);
  }

  /**
   * Registers a JSON Schema object.
   */
  registerSchema(schema: JSONSchema7) {
    if (!schema.$id) {
      throw new Error('Schema must have an $id property.');
    }

    if (this.registry.has(schema.$id)) {
      throw new Error(
        `JSON Schema with id '${schema.$id}' is already registered. Use a different id.`
      );
    }

    this.registry.set(schema.$id, schema);
  }

  private classToSchema(schemaClass: ClassType) {
    const { $id, $schema, ...rest } = generateJsonSchema(schemaClass, {
      includeSubschemas($id) {
        return 'reference';
      },
    });
    return {
      $id: schemaClass.name,
      $schema: 'http://json-schema.org/draft-07/schema#',
      ...rest,
    };
  }

  public contains(schemaName: string | ClassType): boolean {
    if (!schemaName) {
      return false;
    }

    if (typeof schemaName === 'string') {
      return this.registry.get(schemaName) !== undefined;
    }
    return this.registry.has(schemaName.name);
  }

  public get(schemaName: string | ClassType) {
    if (typeof schemaName === 'string') {
      return this.registry.get(schemaName);
    }
    return this.registry.get(schemaName.name);
  }

  public getKeys() {
    return Array.from(this.registry.keys());
  }

  public schemaId(schemaDto: JSONSchema7) {
    return schemaDto.$id ?? schemaDto.constructor.name;
  }
}
