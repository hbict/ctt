import { github, Task, typescript } from 'projen';
import {
  ArrowParens,
  EndOfLine,
  NodePackageManager,
  TrailingComma,
  TypeScriptModuleResolution,
} from 'projen/lib/javascript';
import { TypeScriptProjectOptions } from 'projen/lib/typescript';
import { merge } from 'ts-deepmerge';

import { CalmsEslint } from './calms-eslint';
import { CopilotSetupWorkflow } from './copilot-setup-workflow';
import { Husky } from './husky';
import { ManagedTextFile } from './managed-text-file';
import { TypescriptExecutor } from './types';
import { UpdateSnapshotsWorkflow } from './update-snapshots-workflow';
import { Vitest } from './vitest';

export interface CalmsTypescriptBaseOptions
  extends Omit<
    TypeScriptProjectOptions,
    'defaultReleaseBranch' | 'name' | 'repository'
  > {
  authorEmail: string;

  authorName: string;

  packageJsonName: string;

  typescriptExecutor?: TypescriptExecutor;

  versionControlRepoName?: string;
}

export type CalmsTypescriptBaseOptionsWithDefaults = {
  defaultReleaseBranch: string;
  name: string;
  repository: string;
  typescriptExecutor: TypescriptExecutor;
  versionControlRepoName: string;
} & CalmsTypescriptBaseOptions;

export class CalmsTypescriptBase extends typescript.TypeScriptProject {
  public readonly calmsEslint: CalmsEslint;

  public readonly copilotSetupWorkflow: CopilotSetupWorkflow;

  public readonly defaultTask: Task;

  public readonly husky: Husky;

  public readonly typescriptExecutor: TypescriptExecutor;

  public readonly updateSnapshotsWorkflow: UpdateSnapshotsWorkflow;

  public readonly vitest: Vitest;

  constructor(options: CalmsTypescriptBaseOptions) {
    const versionControlRepoName =
      options.versionControlRepoName ?? options.packageJsonName;

    const versionControlRepoUrl = `https://github.com/hbict/${versionControlRepoName}.git`;

    const defaultOptions: CalmsTypescriptBaseOptionsWithDefaults = {
      authorEmail: options.authorEmail,
      authorName: options.authorName,
      autoDetectBin: false,
      defaultReleaseBranch: 'main',
      depsUpgradeOptions: {
        workflowOptions: {
          labels: ['auto-approve'],
        },
      },
      devDeps: ['ts-deepmerge'],
      disableTsconfigDev: true,
      // most projects will not have a main file
      entrypoint: '',
      eslint: false,
      githubOptions: {
        pullRequestLintOptions: {
          semanticTitleOptions: {
            types: ['chore', 'docs', 'feat', 'fix', 'refactor', 'test'],
          },
        },
      },
      jest: false,
      libdir: 'build',
      minNodeVersion: '22.0.0',
      name: options.packageJsonName,
      npmignoreEnabled: false,
      packageJsonName: options.packageJsonName,
      packageManager: NodePackageManager.PNPM,
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
      repository: versionControlRepoUrl,
      sampleCode: false,
      testdir: '__tests__',
      tsconfig: {
        compilerOptions: {
          allowSyntheticDefaultImports: true,
          baseUrl: '.',
          emitDecoratorMetadata: true,
          inlineSourceMap: undefined,
          lib: ['esnext'],
          // may not be compatible with all node modules, may have to change
          module: 'node16',
          // may not be compatible with all node modules, may have to change
          moduleResolution: TypeScriptModuleResolution.NODE16,
          rootDir: '.',
          skipLibCheck: true,
          sourceMap: true,
          target: 'es2024',
        },
        exclude: ['**/node_modules/*', '**/build/*'],
        include: ['.projenrc.ts', '__tests__/**/*.ts'],
      },

      typescriptExecutor: TypescriptExecutor.TsNode,
      versionControlRepoName,
    };

    const mergedOptions = merge(
      defaultOptions,
      options,
    ) as CalmsTypescriptBaseOptionsWithDefaults;

    super(mergedOptions);

    this.typescriptExecutor = mergedOptions.typescriptExecutor;

    const defaultTask = this.tasks.tryFind('default');
    if (defaultTask) {
      defaultTask.reset(`${this.typescriptExecutor} .projenrc.ts`);
      this.defaultTask = defaultTask;
    } else {
      this.defaultTask = this.addTask('default', {
        exec: `${this.typescriptExecutor} .projenrc.ts`,
      });
    }

    if (this.typescriptExecutor === TypescriptExecutor.Tsx) {
      this.addDevDeps('tsx');
      this.deps.removeDependency('ts-node');
    }

    this.calmsEslint = new CalmsEslint(this);

    this.vitest = new Vitest(this);

    this.husky = new Husky(this);

    this.copilotSetupWorkflow = new CopilotSetupWorkflow(this);

    this.updateSnapshotsWorkflow = new UpdateSnapshotsWorkflow(this);

    this.tryRemoveFile('.npmrc');

    this.addFields({ pnpm: undefined });

    new ManagedTextFile(this, '.npmrc', { lines: ['resolution-mode=highest'] });

    new github.AutoQueue(this, {
      labels: ['auto-approve'],
      targetBranches: ['main'],
    });
  }
}
