import deepmerge from 'deepmerge';
import { AutoQueue } from 'projen/lib/github';
import {
  ArrowParens,
  EndOfLine,
  TrailingComma,
  TypeScriptModuleResolution,
} from 'projen/lib/javascript';
import {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from 'projen/lib/typescript';

import { EslintLatest } from './eslint-latest';
import { Husky } from './husky';
import { Vitest } from './vitest';

export enum CalmsProjectType {
  App = 'app',
  Package = 'package',
}

export type AddRequiredDefaultCalmsTypescriptBaseOptions<TOptionalOptions> = {
  defaultReleaseBranch: string;
  name: string;
} & TOptionalOptions;

export interface CalmsTypescriptBaseOptions
  extends Omit<TypeScriptProjectOptions, 'defaultReleaseBranch' | 'name'> {
  authorEmail: string;

  authorName: string;

  calmsProjectType: CalmsProjectType;

  /**
   * The name to use in the package.json file
   */
  packageJsonName: string;

  repository: string;
}

export class CalmsTypescriptBase extends TypeScriptProject {
  public readonly calmsProjectType: CalmsProjectType;

  constructor(options: CalmsTypescriptBaseOptions) {
    const defaultOutDir = 'build';

    // don't want to default the name
    const defaultOptions: AddRequiredDefaultCalmsTypescriptBaseOptions<TypeScriptProjectOptions> =
      {
        defaultReleaseBranch: 'main',
        depsUpgradeOptions: {
          workflowOptions: {
            labels: ['auto-approve'],
          },
        },
        disableTsconfigDev: true,
        eslint: false,
        githubOptions: {
          pullRequestLintOptions: {
            semanticTitleOptions: {
              types: ['chore', 'docs', 'feat', 'fix', 'test'],
            },
          },
        },
        gitIgnoreOptions: {
          ignorePatterns: [`${defaultOutDir}/`],
        },
        jest: false,
        name: options.packageJsonName,
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
            lib: ['ESNext'],
            // may not be compatible with all node modules, may have to change
            module: 'NodeNext',
            // may not be compatible with all node modules, may have to change
            moduleResolution: TypeScriptModuleResolution.NODE_NEXT,
            outDir: defaultOutDir,
            // need to define this here for vitest
            paths: {
              '*': ['types/*'],
            },
            rootDir: '.',
            types: ['node', 'vitest/globals'],
          },
          include: ['.projenrc.ts', '__tests__/**/*.ts'],
        },
      };

    const mergedOptions = deepmerge<
      AddRequiredDefaultCalmsTypescriptBaseOptions<CalmsTypescriptBaseOptions>
    >(defaultOptions, options);

    super(mergedOptions);

    this.calmsProjectType = mergedOptions.calmsProjectType;

    new EslintLatest(this);

    new Vitest(this);

    new Husky(this);

    new AutoQueue(this, {
      labels: ['auto-approve'],
      targetBranches: ['main'],
    });
  }
}
