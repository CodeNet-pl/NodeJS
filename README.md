# CodeNet Toolkit

Welcome to the CodeNet Toolkit! This repository is a collection of powerful Node.js packages designed to streamline development and solve common challenges in building robust, scalable applications. Each package is tailored to address specific needs, ensuring developers can focus on creating value rather than reinventing the wheel.

## Packages Overview

### 1. `@code-net/database-context`

**Simplify database transactions with ease.**

- Provides an abstraction over database contexts.
- Enables method-level transaction management using decorators.
- Ensures seamless transaction handling across services.

**Use Case:** Automatically manage transactions in complex service layers without manual boilerplate.

---

### 2. `@code-net/database-context-knex`

**Knex.js integration for advanced database management.**

- Implements `@code-net/database-context` using Knex.js.
- Supports schema-specific scoping while reusing connections.
- Ideal for NestJS applications with built-in module support.

**Use Case:** Manage multi-schema databases efficiently in enterprise-grade applications.

---

### 3. `@code-net/errors`

**Structured error handling for better debugging.**

- Categorizes errors into application, domain, and infrastructure layers.
- Provides meaningful error types like `NotFound`, `AccessDenied`, and `ValidationError`.
- Facilitates better separation of concerns and easier testing.

**Use Case:** Replace generic errors with structured, informative error messages.

---

### 4. `@code-net/event-bus`

**Event-driven architecture made simple.**

- Decoupled from frameworks like NestJS for broader usability.
- Supports synchronous event handling and both class-based/POJO events.
- Simplifies event handler registration and execution.

**Use Case:** Build scalable, event-driven systems with minimal setup.

---

### 5. `@code-net/hal`

**Hypertext Application Language (HAL) link types.**

- Defines types for HAL links (GET, POST, PUT, etc.).
- Ensures type safety and consistency in API responses.

**Use Case:** Standardize API responses with HAL-compliant links.

---

### 6. `@code-net/hal-api`

**Create HAL links effortlessly.**

- Simplifies the creation of HAL links in API responses.
- Includes middleware for Express.js and plugin for Fastify to automate link generation.

**Use Case:** Enhance API discoverability with HAL-compliant responses.

---

### 7. `@code-net/hal-json-schema`

**Combine HAL and JSON Schema for powerful APIs.**

- Integrates with `@code-net/json-schema-class` for schema validation.
- Generates JSON Schemas for HAL links.

**Use Case:** Validate and document APIs with HAL and JSON Schema.

---

### 8. `@code-net/identity`

**UUID generation made easy.**

- Wraps the `uuid` package for simplified UUID creation.
- Supports v4 and v5 UUIDs with additional utility methods.

```ts
// Build your own ID value object
class MyId extends Uuid.for('MyId') {}
```

**Use Case:** Generate and manage UUIDs effortlessly in your applications.

---

### 9. `@code-net/json-schema-class`

**JSON Schema generation from TypeScript classes.**

- Translates TypeScript classes into JSON Schema definitions.
- Supports decorators for schema annotations.

**Use Case:** Automate schema generation for validation and documentation.

---

### 10. `@code-net/json-schema-class-nestjs-validation-pipe`

**Validation pipe for NestJS using JSON Schema.**

- Leverages `@code-net/json-schema-class` for validation.
- Integrates seamlessly with NestJS applications.

**Use Case:** Enforce validation rules in NestJS APIs with minimal effort.

---

### 11. `@code-net/logging`

**Abstract logging interface for flexibility.**

- Defines a PSR-3-inspired logging interface.
- Supports multiple log levels and customizable backends.

**Use Case:** Implement consistent logging across applications with your preferred backend.

---

### 12. `@code-net/multi-tenancy`

**Tenant-aware application utilities.**

- Manages tenant-specific contexts in multi-tenant applications.
- Provides lifecycle hooks for tenant context management.

**Use Case:** Build scalable multi-tenant systems with isolated contexts.

---

### 13. `@code-net/pagination`

**Type-safe pagination utilities.**

- Provides classes and types for pagination logic.
- Supports query parsing, validation, and HAL-compatible links.

**Use Case:** Simplify pagination in APIs with robust, type-safe utilities.

---

## Why CodeNet Toolkit?

- **Efficiency:** Pre-built solutions for common challenges.
- **Scalability:** Designed for enterprise-grade applications.
- **Flexibility:** Modular packages to fit your specific needs.

Explore the CodeNet Toolkit and supercharge your Node.js development today!
