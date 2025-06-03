import { JsonFile, Task, TextFile, typescript } from 'projen';
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
      devDeps: [
        '@commitlint/cli',
        '@commitlint/config-conventional',
        'husky',
        'lint-staged',
        'ts-deepmerge',
      ],
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

    /* testing & linting setup begin */
    // don't want the test script to update snapshots and want to run coverage since this is what is used in the build
    this.testTask.updateStep(0, {
      exec: 'jest --passWithNoTests --coverage',
      receiveArgs: true,
    });

    // we want our actual test script to not run with coverage
    this.removeScript('test');

    // want to still have a package.json script for `test`
    this.addScripts({
      test: 'jest --passWithNoTests',
    });

    // remove eslint spawn
    this.testTask.removeStep(1);

    this.addTask('test:coverage', {
      description: 'run tests with coverage',
      exec: 'jest --passWithNoTests --coverage',
      receiveArgs: true,
    });

    // no longer needed as we will use a more generic `lint` task
    this.removeTask('eslint');

    const lintTask = this.addTask('lint', {
      description: 'Runs prettier eslint against the codebase',
      exec: 'prettier --write --no-error-on-unmatched-pattern $@ "{src,__tests__,projenrc}/**/*.ts" .projenrc.ts README.md',
      receiveArgs: true,
    });

    lintTask.exec(
      'yarn eslint --ext .ts --fix --no-error-on-unmatched-pattern $@ src __tests__ projenrc .projenrc.ts',
      { receiveArgs: true },
    );

    this.testTask.prependSpawn(new Task('lint', { receiveArgs: true }), {
      receiveArgs: true,
    });
    /* testing & linting setup end */

    /* husky setup begin */
    this.addScripts({
      postinstall: 'husky',
    });

    new TextFile(this, 'commitlint.config.js', {
      lines: [
        "export default { extends: ['@commitlint/config-conventional'] };",
        '\n',
      ],
    });

    new TextFile(this, '.husky/commit-msg', {
      lines: ['yarn commitlint --edit $1', '\n'],
    });

    new JsonFile(this, '.lintstagedrc.json', {
      obj: {
        '*.md': 'yarn prettier --write',
        '*.ts': 'yarn lint',
      },
    });

    new TextFile(this, '.husky/pre-commit', {
      lines: ['yarn lint-staged', 'yarn test:coverage', '\n'],
    });

    new TextFile(this, '.husky/pre-push', {
      lines: [
        'echo "make sure the project is not out of sync with .projenrc.ts"',
        '\n',
      ],
    });
    /* husky setup end */
  }
}
