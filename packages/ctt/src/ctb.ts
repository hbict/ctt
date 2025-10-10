import { github, Task, typescript } from 'projen';
import { Job, JobPermission } from 'projen/lib/github/workflows-model';
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
import { CopilotInstruction } from './copilot-instruction';
import { CopilotInstructions } from './copilot-instructions';
import { CopilotSetupWorkflow } from './copilot-setup-workflow';
import { GitHooks } from './git-hooks';
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

  public readonly copilotInstructions?: CopilotInstructions;

  public readonly copilotSetupWorkflow?: CopilotSetupWorkflow;

  public readonly defaultTask: Task;

  public readonly gitHooks?: GitHooks;

  public readonly lintTask: Task;

  public readonly repoInstruction?: CopilotInstruction;

  public readonly runBinaryCommand: string;

  public readonly typescriptExecutor: TypescriptExecutor;

  public readonly updateSnapshotsWorkflow?: UpdateSnapshotsWorkflow;

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
      devDeps: ['ts-deepmerge', 'rimraf'],
      disableTsconfigDev: true,
      // most projects will not have a main file
      entrypoint: '',
      eslint: false,
      github: !options.parent,
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

    this.runBinaryCommand =
      this.package.packageManager === NodePackageManager.PNPM
        ? 'pnpm exec'
        : 'npx';

    this.typescriptExecutor = mergedOptions.typescriptExecutor;

    this.calmsEslint = new CalmsEslint(this);

    this.lintTask = this.calmsEslint.lintTask;

    this.vitest = new Vitest(this);

    if (this.parent) {
      this.tryRemoveFile('.npmrc');
    } else {
      this.gitHooks = new GitHooks(this);

      // Add Copilot Instructions only for root projects
      this.copilotInstructions = new CopilotInstructions(this);

      // Add repository-level copilot instructions
      this.repoInstruction = new CopilotInstruction(this, {
        applyTo: '**/*',
        content: `This repository uses projen and @calm/ctt for project management.

**DO NOT** manually edit files managed by projen - they will be overwritten.

To make changes:
1. Edit the \`.projenrc.ts\` file
2. Run \`npx projen\` to regenerate managed files`,
        filePath: '.github/copilot-instructions.md',
        name: this.name,
      });

      if (this.github) {
        this.copilotSetupWorkflow = new CopilotSetupWorkflow(this);

        this.updateSnapshotsWorkflow = new UpdateSnapshotsWorkflow(this);

        new github.AutoQueue(this, {
          labels: ['auto-approve'],
          targetBranches: ['main'],
        });

        // need to modify the installCiTask so the build can update the lock file since it is mutable and since the coding agent can modify the dependencies
        this.package.installCiTask.reset();
        this.package.installCiTask.spawn(this.package.installTask);

        const pullRequestLintWorkflow =
          this.github.tryFindWorkflow('pull-request-lint');
        const validateJob = pullRequestLintWorkflow?.getJob('validate') as
          | Job
          | undefined;

        if (pullRequestLintWorkflow) {
          pullRequestLintWorkflow.on({
            pullRequest: {
              types: [
                'labeled',
                'opened',
                'synchronize',
                'reopened',
                'ready_for_review',
                'edited',
              ],
            },
            pullRequestTarget: undefined,
          });
        }

        if (validateJob?.steps[0]) {
          const correctedValidateJob = {
            ...validateJob,
            permissions: {
              'pull-requests': JobPermission.WRITE,
              statuses: JobPermission.WRITE,
            },
            steps: [
              {
                ...validateJob.steps[0],
                with: {
                  ...validateJob.steps[0].with,
                  wip: true,
                },
              },
            ],
          };

          pullRequestLintWorkflow?.updateJob('validate', correctedValidateJob);
        }
      }
    }

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

    this.preCompileTask.reset('rimraf build');

    this.addFields({ pnpm: undefined });
  }
}
