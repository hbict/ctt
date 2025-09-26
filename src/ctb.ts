import { github, typescript } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
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

export interface CalmsTypescriptBaseOptions
  extends Omit<TypeScriptProjectOptions, 'defaultReleaseBranch' | 'name'> {
  authorEmail: string;

  authorName: string;

  /**
   * The name to use in the package.json file
   */
  packageJsonName: string;

  repository: string;
}

export class CalmsTypescriptBase extends typescript.TypeScriptProject {
  constructor(options: CalmsTypescriptBaseOptions) {
    // don't want to default the name
    const defaultOptions: TypeScriptProjectOptions = {
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

    // Add update-snapshots workflow
    if (this.github) {
      const updateSnapshotsWorkflow = new github.GithubWorkflow(
        this.github,
        'update-snapshots',
        {
          force: true,
        },
      );

      updateSnapshotsWorkflow.on({
        workflowDispatch: {
          inputs: {
            branch: {
              default: 'main',
              description: 'Branch to update snapshots on',
              required: false,
              type: 'string',
            },
          },
        },
      });

      updateSnapshotsWorkflow.addJob('update-snapshots', {
        name: 'Update Snapshots',
        permissions: {
          contents: JobPermission.WRITE,
        },
        runsOn: ['ubuntu-latest'],
        steps: [
          {
            name: 'Checkout',
            uses: 'actions/checkout@v4',
            with: {
              ref: '$' + '{{ github.event.inputs.branch || github.ref }}',
              token: '$' + '{{ secrets.GITHUB_TOKEN }}',
            },
          },
          {
            name: 'Setup Node.js',
            uses: 'actions/setup-node@v4',
            with: {
              cache: 'yarn',
              nodeVersion: '18',
            },
          },
          {
            name: 'Install dependencies',
            run: 'yarn install --check-files',
          },
          {
            name: 'Update snapshots',
            run: 'npx projen test:update-snapshots',
          },
          {
            id: 'changes',
            name: 'Check for changes',
            run: [
              'git add .',
              'if git diff --staged --quiet; then',
              '  echo "has_changes=false" >> $GITHUB_OUTPUT',
              'else',
              '  echo "has_changes=true" >> $GITHUB_OUTPUT',
              'fi',
            ].join('\n'),
          },
          {
            if: "steps.changes.outputs.has_changes == 'true'",
            name: 'Commit and push changes',
            run: [
              'git config --local user.email "action@github.com"',
              'git config --local user.name "GitHub Action"',
              'git commit -m "chore: update test snapshots"',
              'git push',
            ].join('\n'),
          },
        ],
      });
    }
  }
}
