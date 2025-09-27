import { IConstruct } from 'constructs';
import { IResolver } from 'projen';

import { ManagedTextFile, MangedTextFileOptions } from './managed-text-file';

export interface CopilotInstructionOptions
  extends Omit<MangedTextFileOptions, 'lines'> {
  /**
   * The name of the instruction (e.g., 'typescript', 'test')
   */
  readonly name: string;

  /**
   * The appliesTo field value for the instruction file
   */
  readonly appliesTo: string;

  /**
   * The content of the instruction
   */
  readonly content: string;
}

/**
 * A component that renders individual copilot instruction files.
 * Similar to projen Task component, provides methods for modifying instructions.
 */
export class CopilotInstruction extends ManagedTextFile {
  private readonly instructionName: string;
  private readonly appliesTo: string;
  private instructionContent: string;

  constructor(
    project: IConstruct,
    options: CopilotInstructionOptions,
  ) {
    const { name, appliesTo, content, ...textFileOptions } = options;
    
    super(project, `.github/instructions/${name}.instructions.md`, {
      ...textFileOptions,
      commentSymbol: '<!--',
    });

    this.instructionName = name;
    this.appliesTo = appliesTo;
    this.instructionContent = content;
  }

  /**
   * Prepend content to the instruction
   */
  prepend(...lines: string[]): void {
    this.instructionContent = lines.join('\n') + '\n\n' + this.instructionContent;
  }

  /**
   * Append content to the instruction
   */
  append(...lines: string[]): void {
    this.instructionContent = this.instructionContent + '\n\n' + lines.join('\n');
  }

  /**
   * Insert content at a specific line number (1-based indexing)
   */
  insert(lineNumber: number, ...lines: string[]): void {
    const contentLines = this.instructionContent.split('\n');
    const insertIndex = Math.max(0, lineNumber - 1);
    contentLines.splice(insertIndex, 0, ...lines);
    this.instructionContent = contentLines.join('\n');
  }

  /**
   * Remove lines from the instruction (1-based indexing)
   */
  remove(startLine: number, endLine?: number): void {
    const contentLines = this.instructionContent.split('\n');
    const start = Math.max(0, startLine - 1);
    const deleteCount = endLine ? (endLine - startLine + 1) : 1;
    contentLines.splice(start, deleteCount);
    this.instructionContent = contentLines.join('\n');
  }

  /**
   * Replace lines in the instruction (1-based indexing)
   */
  change(startLine: number, endLine: number, ...newLines: string[]): void {
    const contentLines = this.instructionContent.split('\n');
    const start = Math.max(0, startLine - 1);
    const deleteCount = endLine - startLine + 1;
    contentLines.splice(start, deleteCount, ...newLines);
    this.instructionContent = contentLines.join('\n');
  }

  /**
   * Reset the instruction content
   */
  reset(content: string): void {
    this.instructionContent = content;
  }

  protected synthesizeContent(_: IResolver): string | undefined {
    const header = `# ${this.instructionName}\n\nApplies to: \`${this.appliesTo}\`\n\n`;
    return header + this.instructionContent;
  }
}