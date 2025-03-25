# Database Design Task

## Domain Description
{{domain}}

## Entities
{{entities}}

## Relationships
{{relationships}}

## Technical Requirements
- Design for PostgreSQL database
- Use Prisma schema format
- Follow database normalization principles (to 3NF)
- Implement proper indexing for performance
- Use appropriate data types
- Consider soft delete where appropriate
- Implement proper foreign key constraints
- Use meaningful naming conventions
- Add appropriate comments to schema

## Schema Requirements
- Use UUIDs for primary keys where appropriate
- Include created_at and updated_at timestamps
- Implement proper relations with referential integrity
- Consider polymorphic relationships if needed
- Use enums for constrained value sets
- Consider performance implications of the schema design
- Implement appropriate unique constraints
- Use appropriate field types and sizes

## Performance Considerations
- Identify fields that should be indexed
- Consider denormalization where appropriate for performance
- Think about query patterns and optimize schema accordingly
- Consider partitioning strategy for large tables
- Plan for scalability

## Expected Output
Please provide:
1. Complete Prisma schema definition
2. Explanation of key design decisions
3. Entity-relationship diagram (textual representation)
4. Indexing strategy
5. Migration plan (if applicable)
6. Recommendations for optimizing common queries

## Additional Guidelines
- Follow naming conventions consistently
- Consider future extensibility
- Document any non-standard design choices
- Think about data integrity and constraints
- Consider security implications of the schema design