import { InvalidValue } from '@code-net/errors';

export class OrderDirection {
  private constructor(private readonly value: 'asc' | 'desc') {}

  static fromString(value: string) {
    const normalized = value.toLowerCase();
    if (!this.isValid(normalized)) {
      throw new InvalidValue('Invalid sort direction');
    }

    return new OrderDirection(normalized);
  }

  private static isValid(value: string): value is 'asc' | 'desc' {
    return ['asc', 'desc'].includes(value);
  }

  toString() {
    return this.value;
  }
}

export class OrderBy<T extends string> {
  private constructor(
    public readonly property: T,
    public readonly direction: OrderDirection,
  ) {}

  static fromString<T extends string>(value: string) {
    if (typeof value !== 'string') {
      throw new InvalidValue('Invalid order by');
    }
    const sorts = value.split(':').map((v) => v.trim());
    if (sorts[0] === '') {
      throw new InvalidValue('Sort by is empty');
    }

    return new OrderBy<T>(sorts[0] as T, OrderDirection.fromString(sorts[1]));
  }
}
