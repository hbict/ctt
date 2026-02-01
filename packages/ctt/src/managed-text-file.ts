import { format } from '@prettier/sync';
import { IConstruct } from 'constructs';
import { IResolver, TextFile, TextFileOptions } from 'projen';

import { prettierSettings } from './shared';

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

  /**
   * Whether to format the file with prettier after synthesis
   * @default true
   */
  readonly shouldFormatWithPrettier?: boolean;
}

export class ManagedTextFile extends TextFile {
  private readonly commentSymbol: string;

  private readonly shebang?: string;

  private readonly shouldFormatWithPrettier: boolean;

  constructor(project: IConstruct, filePath: string, options: MangedTextFileOptions = {}) {
    super(project, filePath, options);

    const defaultOptions = {
      commentSymbol: '//',
      shouldFormatWithPrettier: true,
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
    };

    this.commentSymbol = mergedOptions.commentSymbol;
    this.shebang = mergedOptions.shebang;
    this.shouldFormatWithPrettier = mergedOptions.shouldFormatWithPrettier;
  }

  protected synthesizeContent(_: IResolver): string | undefined {
    const content = super.synthesizeContent(_);

    if (!content) {
      return undefined;
    }

    const contentWithShebangAndMarker = [
      ...(this.shebang ? [this.shebang, ''] : []),
      ...(this.marker ? [`${this.commentSymbol} ${this.marker}`, ''] : []),
      ...content.split('\n'),
    ].join('\n');

    if (this.shouldFormatWithPrettier) {
      try {
        return format(contentWithShebangAndMarker, {
          ...prettierSettings,
          filepath: this.absolutePath,
        });
      } catch (_error: unknown) {
        // formatting failed, return unformatted content
        return contentWithShebangAndMarker;
      }
    }

    return contentWithShebangAndMarker;
  }
}
