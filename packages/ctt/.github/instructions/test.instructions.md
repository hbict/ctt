# test

Applies to: `**/*.test.ts, **/*-test.ts`

## Test Standards

### Never Test Implementation Details

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

### Use Snapshot Tests for Generated Files

For projen-based projects, snapshot tests automatically validate dependencies and tasks through generated files.

**✅ Good:**

```typescript
// Snapshot tests cover all generated files including deps and tasks
expect(snapshot[fileName]).toMatchSnapshot();
```

### General Guidelines

- Test what your code does, not how it does it
- Focus on public APIs and behavior
- Avoid testing private methods or internal state
- Use descriptive test names that explain the expected behavior
- Prefer integration tests over unit tests when testing components that generate files