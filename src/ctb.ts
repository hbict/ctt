import { github, typescript } from 'projen';
import {
  ArrowParens,
  EndOfLine,
  TrailingComma,
  TypeScriptModuleResolution,
} from 'projen/lib/javascript';
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
      depsUpgradeOptions: {
        workflowOptions: {
          labels: ['auto-approve'],
        },
      },
      devDeps: ['ts-deepmerge'],
      disableTsconfigDev: true,
      eslint: false,
      githubOptions: {
        pullRequestLintOptions: {
          semanticTitleOptions: {
            types: ['chore', 'docs', 'feat', 'fix', 'test'],
          },
        },
      },
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
          baseUrl: '.',
          // may not be compatible with all node modules, may have to change
          module: 'NodeNext',
          // may not be compatible with all node modules, may have to change
          moduleResolution: TypeScriptModuleResolution.NODE_NEXT,
          // need to define this here for vitest
          paths: {
            '*': ['types/*'],
          },
          rootDir: '.',
          types: ['vitest/globals'],
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

    new github.AutoQueue(this, {
      labels: ['auto-approve'],
      targetBranches: ['main'],
    });
  }
}
