# Swagger Documentation Generator

## Code to Document
```
{{code}}
```

## Requirements
Please add comprehensive Swagger/OpenAPI annotations to the provided code, including:

- `@ApiTags` for controllers
- `@ApiOperation` for each endpoint
- `@ApiResponse` for all possible response scenarios
- `@ApiParam` for path parameters
- `@ApiQuery` for query parameters
- `@ApiBody` for request bodies
- `@ApiProperty` for all DTO properties
- `@ApiHeader` for required headers (if applicable)
- `@ApiBearerAuth` for secured endpoints (if applicable)

## Guidelines

1. **Controller Documentation**:
   - Use `@ApiTags` to categorize endpoints
   - Provide clear `@ApiOperation` descriptions for each method
   - Document all possible response status codes with `@ApiResponse`
   - Include example responses where helpful

2. **DTO Documentation**:
   - Add `@ApiProperty` to all properties
   - Include type information, examples, and descriptions
   - Mark required vs. optional properties
   - Document any validation constraints

3. **Parameter Documentation**:
   - Document all path parameters with `@ApiParam`
   - Include descriptions, types, and examples
   - Document query parameters with `@ApiQuery`
   - Specify default values where applicable

4. **Security Documentation**:
   - Add appropriate security annotations
   - Document required scopes or permissions
   - Include authentication requirements

## Output Format
Provide the fully documented code with all Swagger annotations correctly placed. Ensure the annotations are comprehensive and provide meaningful information to API consumers.