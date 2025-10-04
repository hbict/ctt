# Test Standards for CTT (Calm's TypeScript Templates)

Applies to: `**/*.test.ts`, `**/*-test.ts`

## Never Test Implementation Details

Focus on testing behavior and outputs, not internal implementation details.

**❌ Avoid:**

```typescript
// Testing constructor names, internal properties, etc.
expect(project.constructor.name).toBe('CalmsTypescriptCdk');
expect(project.internalProperty).toBeDefined();
```

**✅ Good:**

```typescript
// Test behavior and outputs
expect(generatedFiles).toContain('package.json');
expect(snapshot[fileName]).toMatchSnapshot();
```

## General Guidelines

- Test what your code does, not how it does it
- Focus on public APIs and behavior
- Avoid testing private methods or internal state
- Use descriptive test names that explain the expected behavior
- Prefer integration tests over unit tests when testing components that generate files
