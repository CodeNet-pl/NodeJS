# @code-net/pagination

A TypeScript library providing classes and types to handle pagination logic in Node.js applications.

## Installation

```bash
npm install @code-net/pagination
```

## Features

- Type-safe pagination structures
- Page query parsing with validation
- Ordering/sorting support with direction
- JSON Schema DTOs for API responses
- HAL-compatible pagination links

## Usage

### Basic Types

#### `PageQuery`

Represents pagination parameters for a request:

```typescript
import { PageQuery, toPageQuery } from '@code-net/pagination';

// Parse query parameters from a request
const query = toPageQuery({ page: '2', limit: '20' });
// Result: { page: 2, limit: 20 }

// Handles invalid or missing values with sensible defaults
const defaultQuery = toPageQuery({});
// Result: { page: 1, limit: 10 }
```

#### `PageSummary`

Represents metadata about the current page:

```typescript
import { PageSummary } from '@code-net/pagination';

const summary: PageSummary = {
  number: 1,      // Current page number
  total: 5,       // Total number of pages
  limit: 20,      // Items per page
  totalItems: 100 // Total number of items
};
```

#### `Paginated<T>`

A generic wrapper for paginated results:

```typescript
import { Paginated } from '@code-net/pagination';

interface User {
  id: string;
  name: string;
}

const result: Paginated<User> = {
  items: [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' }
  ],
  page: {
    number: 1,
    total: 5,
    limit: 20,
    totalItems: 100
  }
};
```

### Page Navigation Helpers

```typescript
import { hasNextPage, nextPageParams } from '@code-net/pagination';

const pageSummary: PageSummary = {
  number: 1,
  total: 5,
  limit: 20,
  totalItems: 100
};

// Check if there's a next page
if (hasNextPage(pageSummary)) {
  // Get params for the next page
  const nextParams = nextPageParams(pageSummary);
  // Result: { page: 2, limit: 20 }
}
```

### Ordering / Sorting

```typescript
import { OrderBy, OrderDirection } from '@code-net/pagination';

// Parse order from string (e.g., from query parameter)
const orderBy = OrderBy.fromString<'name' | 'createdAt'>('name:asc');

console.log(orderBy.property);  // 'name'
console.log(orderBy.direction.toString()); // 'asc'

// Throws InvalidValue error for invalid input
OrderBy.fromString(''); // Error: Sort by is empty
OrderBy.fromString('name:invalid'); // Error: Invalid sort direction
```

### JSON Schema DTOs

For API response serialization with JSON Schema support:

```typescript
import { PageSummaryDto, PaginationLinksDto } from '@code-net/pagination/json-schema';
```

#### `PageSummaryDto`

A JSON Schema decorated class implementing `PageSummary`:

```typescript
import { JsonSchema, Required } from '@code-net/json-schema-class';
import { PageSummaryDto } from '@code-net/pagination/json-schema';

// Use in your API response DTOs
@JsonSchema()
class UserListResponseDto {
  @Required()
  items: UserDto[];

  @Required()
  page: PageSummaryDto;
}
```

#### `PaginationLinksDto`

HAL-compatible pagination links for hypermedia APIs:

```typescript
import { JsonSchema, Required } from '@code-net/json-schema-class';
import { PaginationLinksDto } from '@code-net/pagination/json-schema';

// Contains optional 'next' and 'self' HAL links
@JsonSchema()
class UserListResponseDto {
  @Required()
  items: UserDto[];
  
  @Required()
  page: PageSummaryDto;

  @Required()
  _links: PaginationLinksDto;
}
```

## License

See the [LICENSE](../../LICENSE) file in the repository root.
