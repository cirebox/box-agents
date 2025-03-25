# Code Analysis Request

## Code Snippet
```
{{codeSnippet}}
```

## Analysis Type
{{analysisType}}

## What to Analyze

### Security (applies when analysis type is 'security' or 'all')
- Identify potential security vulnerabilities
- Look for injection points (SQL, NoSQL, command)
- Check for authentication/authorization issues
- Identify insecure data handling practices
- Evaluate input validation and sanitization
- Check for sensitive information exposure

### Performance (applies when analysis type is 'performance' or 'all')
- Identify performance bottlenecks
- Evaluate memory usage concerns
- Assess algorithm efficiency
- Check database query optimization
- Look for unnecessary operations or computations
- Evaluate caching opportunities

### Quality (applies when analysis type is 'quality' or 'all')
- Evaluate code style and adherence to best practices
- Identify SOLID principles violations
- Assess maintainability issues
- Check for code duplication
- Evaluate naming conventions and readability
- Assess modularity and separation of concerns
- Check error handling completeness

## Output Format
Please provide a detailed analysis with specific recommendations for improvement. For each issue:
1. Describe the problem
2. Explain why it's an issue
3. Provide a code sample showing how to fix it
4. Explain the benefits of the suggested fix

Organize your response into sections based on severity:
- Critical issues (must be fixed immediately)
- Important issues (should be addressed soon)
- Minor improvements (nice to have)

End with a summary of the overall code quality and the top 3 recommended actions.