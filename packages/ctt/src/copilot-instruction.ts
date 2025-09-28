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
  readonly content: string;

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

    // Initialize content lines with GitHub copilot format
    this.contentLines = [
      '---',
      `applyTo: "${options.applyTo}"`,
      '---',
      '',
      `# ${options.name} Instructions`,
      '',
      ...options.content.split('\n'),
    ];

    // Add all lines to the file
    this.contentLines.forEach(line => {
      this.addLine(line);
    });
  }

  /**
   * Append content to the instruction
   */
  public append(content: string): void {
    this.contentLines = [...this.contentLines, '', ...content.split('\n')];
    this._rebuildFile();
  }

  /**
   * Insert content at a specific line number (1-based indexing)
   */
  public insertAt(lineNumber: number, content: string): void {
    const newLines = content.split('\n');
    this.contentLines = [
      ...this.contentLines.slice(0, lineNumber - 1),
      ...newLines,
      ...this.contentLines.slice(lineNumber - 1),
    ];
    this._rebuildFile();
  }

  /**
   * Prepend content to the instruction (after frontmatter and title)
   */
  public prepend(content: string): void {
    const headerEndIndex = this.contentLines.findIndex(
      (line, index) => index > 5 && line.trim() !== '' && !line.startsWith('#'),
    );

    const insertIndex = headerEndIndex === -1 ? 6 : headerEndIndex;
    const newLines = content.split('\n');

    this.contentLines = [
      ...this.contentLines.slice(0, insertIndex),
      '',
      ...newLines,
      ...this.contentLines.slice(insertIndex),
    ];
    this._rebuildFile();
  }

  /**
   * Remove content at a specific line number (1-based indexing)
   */
  public removeAt(lineNumber: number): void {
    this.contentLines = [
      ...this.contentLines.slice(0, lineNumber - 1),
      ...this.contentLines.slice(lineNumber),
    ];
    this._rebuildFile();
  }

  /**
   * Replace content at a specific line number (1-based indexing)
   */
  public replaceAt(lineNumber: number, content: string): void {
    const newLines = content.split('\n');
    this.contentLines = [
      ...this.contentLines.slice(0, lineNumber - 1),
      ...newLines,
      ...this.contentLines.slice(lineNumber),
    ];
    this._rebuildFile();
  }

  /**
   * Update the main instruction content (everything after the title)
   */
  public updateContent(content: string): void {
    // Keep frontmatter and title, replace everything else
    const titleIndex = this.contentLines.findIndex(line =>
      line.startsWith('# '),
    );
    if (titleIndex !== -1) {
      this.contentLines = [
        ...this.contentLines.slice(0, titleIndex + 1),
        '',
        ...content.split('\n'),
      ];
      this._rebuildFile();
    }
  }

  protected synthesizeContent(_resolver: IResolver): string | undefined {
    // Override to use our internal lines instead of the parent's lines
    const content = this.contentLines.join('\n');

    if (this.marker) {
      return `<!-- ${this.marker} -->\n\n${content}`;
    }

    return content;
  }

  private _rebuildFile(): void {
    // Clear current content and rebuild from contentLines
    // Since TextFile doesn't have a clear method, we need to work with what we have
    // The synthesizeContent method will handle rendering the final content
  }
}
