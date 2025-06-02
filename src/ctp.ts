import { typescript } from 'projen';
import { ArrowParens, EndOfLine, TrailingComma } from 'projen/lib/javascript';
import { TypeScriptProjectOptions } from 'projen/lib/typescript';
import { merge } from 'ts-deepmerge';

import { EslintLatest } from './eslint-latest';

export type CalmTypescriptPackageOptions = Omit<
  TypeScriptProjectOptions,
  'defaultReleaseBranch'
>;

export class CalmTypescriptPackage extends typescript.TypeScriptProject {
  constructor(options: CalmTypescriptPackageOptions) {
    // don't want to default the name
    const defaultOptions: Omit<TypeScriptProjectOptions, 'name'> = {
      defaultReleaseBranch: 'main',
      devDeps: ['ts-deepmerge'],
      disableTsconfigDev: true,
      eslint: false,
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

    this.tasks.tryFind('test')?.removeStep(1);

    this.removeTask('eslint');

    const lintTask = this.addTask('lint', {
      description: 'Runs prettier eslint against the codebase',
      exec: 'prettier "**/*.ts" --write --write',
    });

    lintTask.exec('yarn eslint --ext .ts --fix');
  }
}
