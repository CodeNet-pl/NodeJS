import { InvalidValue } from '@code-net/errors';
import { NIL, v4, v5, validate } from 'uuid';

export const uuid = {
  v4: () => v4(),
  v5: (str: string, namespace = NIL): string => v5(str, namespace),
  isValid: (str: string) => {
    return validate(str);
  },
};

export class Uuid<T = unknown> {
  private readonly __brand!: T;

  constructor(private readonly id: string = uuid.v4()) {
    if (!uuid.isValid(id)) {
      throw new InvalidValue(
        `${this.constructor.name} is not valid UUID, given: "${id}"`
      );
    }
  }

  toV5(str: string) {
    return new Uuid(uuid.v5(str, this.id));
  }

  toString() {
    return this.id;
  }

  equals(other: Uuid<T>) {
    return this.id === other.id;
  }

  toJSON() {
    return this.id;
  }

  get uuid() {
    return this.id;
  }

  valueOf() {
    return this.id;
  }
}
