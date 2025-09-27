import { IConstruct } from 'constructs';
import { IResolver, TextFile, TextFileOptions } from 'projen';

export interface MangedTextFileOptions extends TextFileOptions {
  /**
   * The symbol used to denote a comment for the given file. (i.e. `#` or `//`)
   * @default '//'
   */
  readonly commentSymbol?: string;

  /**
   * A marker to indicate which interpreter to run
   */
  readonly shebang?: string;
}

export class ManagedTextFile extends TextFile {
  private readonly commentSymbol: string;

  private readonly shebang?: string;

  constructor(
    project: IConstruct,
    filePath: string,
    options: MangedTextFileOptions = {},
  ) {
    super(project, filePath, options);

    const defaultOptions = {
      commentSymbol: '//',
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
    };

    this.commentSymbol = mergedOptions.commentSymbol;
    this.shebang = mergedOptions.shebang;
  }

  protected synthesizeContent(_: IResolver): string | undefined {
    const content = super.synthesizeContent(_);

    if (!content) {
      return undefined;
    }

    return [
      ...(this.shebang ? [this.shebang, ''] : []),
      ...(this.marker ? [`${this.commentSymbol} ${this.marker}`, ''] : []),
      ...content.split('\n'),
    ].join('\n');
  }
}
