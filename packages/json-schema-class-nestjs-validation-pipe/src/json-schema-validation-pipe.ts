import { JsonSchemaResolver } from '@code-net/json-schema-class';
import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import Ajv, { Ajv as AjvType, ValidateFunction } from 'ajv';

export class JsonSchemaValidationPipe implements PipeTransform {
  private ajv: AjvType;
  private resolver: JsonSchemaResolver;
  private createError: (ajv: ValidateFunction) => Error;

  constructor(options?: {
    resolver: JsonSchemaResolver;
    ajv: AjvType;
    createError: (ajv: ValidateFunction) => Error;
  }) {
    this.resolver =
      options?.resolver ??
      new JsonSchemaResolver((schema) => `/definitions/${schema}.json#`);
    this.ajv =
      options?.ajv ??
      new Ajv({
        passContext: false,
        validateSchema: false,
        allErrors: true,
        schemas: this.resolver.all(),
      });
    this.createError =
      options?.createError ??
      ((ajv: ValidateFunction) =>
        new BadRequestException(this.ajv.errorsText(ajv.errors)));
  }

  async transform(value: unknown, metadata: ArgumentMetadata) {
    if (!metadata.metatype || metadata.type !== 'body') {
      return value;
    }
    const schemaId = this.resolver.schemaId(metadata.metatype);
    const validate = this.ajv.getSchema(schemaId);
    if (!validate) {
      return value;
    }

    const isValid = validate(value);
    if (isValid) {
      return value;
    }

    throw this.createError(validate);
  }
}
