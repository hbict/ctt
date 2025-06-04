import { typescript } from 'projen';
import { ArrowParens, EndOfLine, TrailingComma } from 'projen/lib/javascript';
import { TypeScriptProjectOptions } from 'projen/lib/typescript';
import { merge } from 'ts-deepmerge';

import { EslintLatest } from './eslint-latest';
import { Husky } from './husky';
import { Vitest } from './vitest';

export type CalmTypescriptBaseOptions = Omit<
  TypeScriptProjectOptions,
  'defaultReleaseBranch'
>;

export class CalmTypescriptBase extends typescript.TypeScriptProject {
  constructor(options: CalmTypescriptBaseOptions) {
    // don't want to default the name
    const defaultOptions: Omit<TypeScriptProjectOptions, 'name'> = {
      defaultReleaseBranch: 'main',
      devDeps: ['ts-deepmerge'],
      disableTsconfigDev: true,
      eslint: false,
      jest: false,
      prettier: true,
      prettierOptions: {
        settings: {
          arrowParens: ArrowParens.AVOID,
          endOfLine: EndOfLine.LF,
          printWidth: 80,
          semi: true,
          singleQuote: true,
          trailingComma: TrailingComma.ALL,
        },
      },
      projenrcTs: true,
      sampleCode: false,
      testdir: '__tests__',
      tsconfig: {
        compilerOptions: {
          rootDir: '.',
        },
        include: ['.projenrc.ts', '__tests__/**/*.ts'],
      },
    };

    const mergedOptions: TypeScriptProjectOptions = merge(
      defaultOptions,
      options,
    );

    super(mergedOptions);

    new EslintLatest(this);

    new Vitest(this);

    new Husky(this);
  }
}
