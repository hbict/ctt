# TypeScript Coding Standards for CTT

## General Guidelines

### Optional Chaining

Use the optional chaining operator (`?.`) wherever possible to avoid unnecessary if statements.

**✅ Good:**

```typescript
this.tsconfig?.addInclude('cdk/**/*.ts');
project.testTask?.spawn(newTask);
```

**❌ Avoid:**

```typescript
if (this.tsconfig) {
  this.tsconfig.addInclude('cdk/**/*.ts');
}
```

### Task Access

Prefer using instance task properties over `tryFind` when accessing common tasks.

**✅ Good:**

```typescript
this.preCompileTask.reset('rimraf build');
this.postCompileTask.reset('cdk synth --silent');
this.compileTask.reset('tsc --noEmit');
```

**❌ Avoid:**

```typescript
const preCompileTask = this.tasks.tryFind('pre-compile');
if (preCompileTask) {
  preCompileTask.reset('rimraf build');
}
```

### Common Task Properties Available

- `this.preCompileTask`
- `this.postCompileTask`
- `this.compileTask`
- `this.testTask`
- `this.defaultTask`

## Project Structure

- Use consistent patterns for extending base classes
- Prefer composition over duplication of dependencies
- Keep project-specific customizations minimal and focused
