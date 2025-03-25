# Backend Development Task

## Resource
{{resource}}

## Endpoints to Implement
{{endpoints}}

## Methods to Implement
{{methods}}

## Technical Requirements
- Use NestJS framework with TypeScript
- Follow the modular architecture pattern
- Implement proper DTO validation with class-validator
- Use Prisma as the ORM for database operations
- Include Swagger documentation for all endpoints
- Implement proper error handling with custom exceptions
- Follow RESTful API design principles
- Use dependency injection and SOLID principles
- Include appropriate logging for operations
- Add unit tests for services

## Expected Output
Please generate the following components:
1. **Module file** - Configure the module with all necessary providers and controllers
2. **Controller** - Implement all specified endpoints with proper request/response handling
3. **DTOs** - Create necessary Data Transfer Objects with validation
4. **Service** - Implement all business logic
5. **Repository Interface** - Define the repository contract
6. **Prisma Repository** - Implement the repository using Prisma
7. **Unit Tests** - Basic test cases for the services

## Architecture Guidelines
Follow the project's established architecture:
- Controllers should only handle HTTP requests/responses and delegate to services
- Services should implement use cases and business logic
- Repositories should handle data access
- DTOs should validate incoming data
- Use interfaces for dependency injection

## Coding Standards
- Use meaningful variable and function names
- Add appropriate comments
- Follow TypeScript best practices with proper typing
- Handle errors appropriately with custom exception filters
- Implement proper validation for all inputs
- Use async/await for asynchronous operations
- Follow NestJS naming conventions