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
   * The name of the instruction (e.g., 'typescript', 'testing')
   */
  readonly name: string;
}

export class CopilotInstruction extends ManagedTextFile {
  public readonly applyTo: string;

  public readonly name: string;

  private contentLines: readonly string[] = [];

  constructor(
    project: IConstruct,
    filePath: string,
    options: CopilotInstructionOptions,
  ) {
    super(project, filePath, {
      ...options,
      commentSymbol: '<!-- ',
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
    this.contentLines = [...this.contentLines, '', ...content.split('\n')];
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
    this.contentLines = ['', ...newLines, ...this.contentLines];
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
  public reset(content?: string): void {
    if (content !== undefined) {
      this.contentLines = content.split('\n');
    } else {
      this.contentLines = [];
    }
  }

  protected synthesizeContent(_resolver: IResolver): string | undefined {
    // Build the complete file content including frontmatter and header
    const allLines = [
      '---',
      `applyTo: "${this.applyTo}"`,
      '---',
      '',
      `# ${this.name} Instructions`,
      '',
      ...this.contentLines,
    ];

    const content = allLines.join('\n');

    if (this.marker) {
      return `<!-- ${this.marker} -->\n\n${content}`;
    }

    return content;
  }
}
