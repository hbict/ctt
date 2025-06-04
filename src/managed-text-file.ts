import { IConstruct } from 'constructs';
import { IResolver, TextFile, TextFileOptions } from 'projen';

export interface MangedTextFileOptions extends TextFileOptions {
  /**
   * The symbol used to denote a comment for the given file. (i.e. `#` or `//`)
   * @default '//'
   */
  readonly commentSymbol?: string;
}

export class ManagedTextFile extends TextFile {
  private readonly commentSymbol: string;

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
  }

  protected synthesizeContent(_: IResolver): string | undefined {
    const content = super.synthesizeContent(_);

    if (!content) {
      return undefined;
    }

    return [
      ...(this.marker ? [`${this.commentSymbol} ${this.marker}`, ''] : []),
      ...content.split('\n'),
    ].join('\n');
  }
}
