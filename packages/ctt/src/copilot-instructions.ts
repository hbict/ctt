import { Component } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

import {
  CopilotInstruction,
  CopilotInstructionOptions,
} from './copilot-instruction';

export interface CopilotInstructionsOptions {
  /**
   * Base path for instruction files
   * @default '.github/instructions'
   */
  readonly basePath?: string;
}

export class CopilotInstructions extends Component {
  public readonly basePath: string;

  public readonly testInstruction: CopilotInstruction;

  public readonly typescriptInstruction: CopilotInstruction;

  private readonly instructions: Map<string, CopilotInstruction> = new Map();

  constructor(
    project: TypeScriptProject,
    options: CopilotInstructionsOptions = {},
  ) {
    super(project);

    this.basePath = options.basePath ?? '.github/instructions';

    // Create default instructions
    this.typescriptInstruction = this.addInstruction('typescript', {
      applyTo: '**/*.ts,**/*.tsx',
      content: `## Code Style
- Use strict TypeScript configuration with all strict checks enabled
- Prefer explicit types over \`any\` - use proper typing
- Use optional chaining (\`?.\`) wherever possible to avoid unnecessary if statements
- Use nullish coalescing (\`??\`) for default value assignment
- ALWAYS prefer concise syntax like \`obj?.method()\` over verbose \`if (obj) { obj.method(); }\` unless multiple statements depend on the condition

## Project Structure
- Follow the established project structure with \`src/\` for source code
- Place tests in \`__tests__/\` directory with \`.test.ts\` extension
- Use proper module imports/exports

## Best Practices
- Keep functions and classes focused and single-purpose
- Use meaningful variable and function names
- Document complex logic with comments
- Leverage TypeScript's type system for better code safety`,
    });

    this.testInstruction = this.addInstruction('test', {
      applyTo: '**/__tests__/*.ts,**/*.test.ts',
      content: `## Test Structure
- Use Vitest as the testing framework
- Place tests in \`__tests__\` directory with \`.test.ts\` extension
- Use descriptive test names that explain what is being tested

## Test Patterns
- Use \`describe\` blocks to group related tests
- Use snapshot tests for generated files validation
- Test both success and error conditions
- Mock external dependencies appropriately

## Coverage
- Aim for high test coverage
- Focus on testing critical business logic
- Include integration tests for complex workflows`,
    });
  }

  /**
   * Add a new instruction file
   */
  public addInstruction(
    name: string,
    options: Omit<CopilotInstructionOptions, 'name'>,
  ): CopilotInstruction {
    const filePath =
      options.filePath ?? `${this.basePath}/${name}.instructions.md`;

    const instruction = new CopilotInstruction(this.project, {
      ...options,
      filePath,
      name,
    });

    this.instructions.set(name, instruction);
    return instruction;
  }

  /**
   * Find an instruction by name
   */
  public findInstruction(name: string): CopilotInstruction | undefined {
    return this.instructions.get(name);
  }

  /**
   * Get all instruction names
   */
  public getInstructionNames(): string[] {
    return Array.from(this.instructions.keys());
  }

  /**
   * Get all instructions
   */
  public getInstructions(): CopilotInstruction[] {
    return Array.from(this.instructions.values());
  }

  /**
   * Remove an instruction
   */
  public removeInstruction(name: string): boolean {
    const instruction = this.instructions.get(name);
    if (instruction) {
      // Remove the file from the project
      this.project.tryRemoveFile(`${this.basePath}/${name}.instructions.md`);
      this.instructions.delete(name);
      return true;
    }
    return false;
  }
}
