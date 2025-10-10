import { IConstruct } from 'constructs';
import { IResolver } from 'projen';

import { ManagedTextFile, MangedTextFileOptions } from './managed-text-file';

export interface CopilotInstructionOptions extends MangedTextFileOptions {
  /**
   * What this instruction applies to (e.g., `**\/*.ts,**\/*.tsx`)
   */
  readonly applyTo: string;

  /**
   * The content of the instruction
   */
  readonly content?: string;

  /**
   * Custom file path for the instruction file
   * @default `.github/instructions/${name}.instructions.md`
   */
  readonly filePath?: string;

  /**
   * The name of the instruction (e.g., 'typescript', 'testing')
   */
  readonly name: string;
}

export class CopilotInstruction extends ManagedTextFile {
  public readonly name: string;

  private applyTo: string;

  private contentLines: readonly string[] = [];

  constructor(project: IConstruct, options: CopilotInstructionOptions) {
    const filePath =
      options.filePath ??
      `.github/instructions/${options.name}.instructions.md`;

    super(project, filePath, {
      ...options,
    });

    this.name = options.name;
    this.applyTo = options.applyTo;

    // Initialize content lines with only the actual content
    this.contentLines = options.content?.split('\n') ?? [];
  }

  /**
   * Append content to the instruction
   */
  public append(content: string): void {
    this.contentLines = [...this.contentLines, ...content.split('\n')];
  }

  /**
   * Insert content at a specific line number (1-based indexing)
   */
  public insert(lineNumber: number, content: string): void {
    const newLines = content.split('\n');
    this.contentLines = [
      ...this.contentLines.slice(0, lineNumber - 1),
      ...newLines,
      ...this.contentLines.slice(lineNumber - 1),
    ];
  }

  /**
   * Prepend content to the instruction
   */
  public prepend(content: string): void {
    const newLines = content.split('\n');
    this.contentLines = [...newLines, ...this.contentLines];
  }

  /**
   * Remove content at line numbers (1-based indexing)
   */
  public remove(startLineNumber: number, endLineNumber?: number): void {
    const end = endLineNumber ?? startLineNumber;
    this.contentLines = [
      ...this.contentLines.slice(0, startLineNumber - 1),
      ...this.contentLines.slice(end),
    ];
  }

  /**
   * Replace content at line numbers (1-based indexing)
   */
  public replace(
    startLineNumber: number,
    endLineNumber: number,
    content: string,
  ): void {
    const newLines = content.split('\n');
    this.contentLines = [
      ...this.contentLines.slice(0, startLineNumber - 1),
      ...newLines,
      ...this.contentLines.slice(endLineNumber),
    ];
  }

  /**
   * Reset the instruction content like projen tasks
   */
  public reset(content?: string, options?: { applyTo?: string }): void {
    if (content !== undefined) {
      this.contentLines = content.split('\n');
    } else {
      this.contentLines = [];
    }

    // Update applyTo if provided
    if (options?.applyTo) {
      this.applyTo = options.applyTo;
    }
  }

  protected synthesizeContent(_resolver: IResolver): string | undefined {
    // Build frontmatter first
    const frontmatter = ['---', `applyTo: "${this.applyTo}"`, '---'];

    // Build content section
    const contentSection = [
      `# ${this.name} Instructions`,
      '',
      ...this.contentLines,
    ];

    // Combine all parts immutably
    const baseParts = [frontmatter.join('\n'), ''];

    // Add marker if needed and content
    if (this.marker) {
      return [
        ...baseParts,
        `<!-- ${this.marker} -->`,
        '',
        contentSection.join('\n'),
      ].join('\n');
    }

    return [...baseParts, contentSection.join('\n')].join('\n');
  }
}
