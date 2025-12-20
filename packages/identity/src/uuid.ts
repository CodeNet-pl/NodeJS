import { InvalidValue } from '@code-net/errors';
import { NIL, v4, v5, v7, validate } from 'uuid';

export const uuid = {
  /**
   * Use v4 UUIDs for random unique identifiers.
   */
  v4: () => v4(),

  /**
   * Use v5 UUIDs for generating unique identifiers from namespaced strings.
   */
  v5: (str: string, uuidNS: string = NIL): string => v5(str, uuidNS),

  /**
   * Use v7 UUIDs for sortable unique identifiers, eg. database primary keys.
   */
  v7: () => v7(),
  isValid: (str: string) => {
    return validate(str);
  },
};

export class Uuid<T = unknown> {
  private readonly __brand!: T;

  constructor(private readonly id: string = uuid.v7()) {
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
