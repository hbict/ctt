import { Component } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

import { CopilotInstruction, CopilotInstructionOptions } from './copilot-instruction';

/**
 * A component that manages multiple copilot instruction files.
 * Similar to projen Tasks component, provides methods for adding, finding, and removing instructions.
 */
export class CopilotInstructions extends Component {
  private readonly instructions = new Map<string, CopilotInstruction>();

  public readonly typescriptInstruction: CopilotInstruction;
  public readonly testInstruction: CopilotInstruction;

  constructor(project: TypeScriptProject) {
    super(project);

    // Create default typescript instruction
    this.typescriptInstruction = this.add({
      name: 'typescript',
      appliesTo: '**/*.ts, **/*.tsx',
      content: `## TypeScript Best Practices

### Optional Chaining

Use the optional chaining operator (\`?.\`) wherever possible to avoid unnecessary if statements.

**✅ Good:**

\`\`\`typescript
this.tsconfig?.addInclude('src/**/*.ts');
project.testTask?.spawn(newTask);
\`\`\`

**❌ Avoid:**

\`\`\`typescript
if (this.tsconfig) {
  this.tsconfig.addInclude('src/**/*.ts');
}
\`\`\`

### Type Safety

Always prefer explicit typing over \`any\` type.

**✅ Good:**

\`\`\`typescript
interface ProjectOptions {
  name: string;
  version?: string;
}
\`\`\`

**❌ Avoid:**

\`\`\`typescript
const options: any = { name: 'project' };
\`\`\``,
    });

    // Create default test instruction
    this.testInstruction = this.add({
      name: 'test',
      appliesTo: '**/*.test.ts, **/*-test.ts',
      content: `## Test Standards

### Never Test Implementation Details

Focus on testing behavior and outputs, not internal implementation details.

**❌ Avoid:**

\`\`\`typescript
// Testing constructor names, internal properties, etc.
expect(project.constructor.name).toBe('CalmsTypescriptCdk');
expect(project.internalProperty).toBeDefined();
\`\`\`

**✅ Good:**

\`\`\`typescript
// Test behavior and outputs
expect(generatedFiles).toContain('package.json');
expect(snapshot[fileName]).toMatchSnapshot();
\`\`\`

### Use Snapshot Tests for Generated Files

For projen-based projects, snapshot tests automatically validate dependencies and tasks through generated files.

**✅ Good:**

\`\`\`typescript
// Snapshot tests cover all generated files including deps and tasks
expect(snapshot[fileName]).toMatchSnapshot();
\`\`\`

### General Guidelines

- Test what your code does, not how it does it
- Focus on public APIs and behavior
- Avoid testing private methods or internal state
- Use descriptive test names that explain the expected behavior
- Prefer integration tests over unit tests when testing components that generate files`,
    });
  }

  /**
   * Add a new copilot instruction
   */
  add(options: Omit<CopilotInstructionOptions, 'commentSymbol'>): CopilotInstruction {
    const instruction = new CopilotInstruction(this.project, options);
    this.instructions.set(options.name, instruction);
    return instruction;
  }

  /**
   * Find an existing copilot instruction by name
   */
  tryFind(name: string): CopilotInstruction | undefined {
    return this.instructions.get(name);
  }

  /**
   * Remove a copilot instruction
   */
  remove(name: string): boolean {
    const instruction = this.instructions.get(name);
    if (instruction) {
      // Remove the file from the project
      this.project.tryRemoveFile(`.github/instructions/${name}.instructions.md`);
      this.instructions.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Get all instruction names
   */
  get names(): string[] {
    return Array.from(this.instructions.keys()).sort();
  }

  /**
   * Get all instructions
   */
  get all(): CopilotInstruction[] {
    return Array.from(this.instructions.values());
  }
}