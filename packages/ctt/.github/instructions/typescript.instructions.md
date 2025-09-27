# typescript

Applies to: `**/*.ts, **/*.tsx`

## TypeScript Best Practices

### Optional Chaining

Use the optional chaining operator (`?.`) wherever possible to avoid unnecessary if statements.

**✅ Good:**

```typescript
this.tsconfig?.addInclude('src/**/*.ts');
project.testTask?.spawn(newTask);
```

**❌ Avoid:**

```typescript
if (this.tsconfig) {
  this.tsconfig.addInclude('src/**/*.ts');
}
```

### Type Safety

Always prefer explicit typing over `any` type.

**✅ Good:**

```typescript
interface ProjectOptions {
  name: string;
  version?: string;
}
```

**❌ Avoid:**

```typescript
const options: any = { name: 'project' };
```