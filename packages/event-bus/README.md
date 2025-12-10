# CQRS module

This module has been rewritten from `@nestjs/cqrs` with added capabilities to:

* Decoupled EventBus from the framework, making it usable in non-NestJS applications;
* Execute event handlers synchronously at the time when an event is published;
