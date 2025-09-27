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

import { CopilotInstructions } from './copilot-instructions';
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
  readonly packageJsonName: string;
  readonly typescriptExecutor?: TypescriptExecutor | undefined;
  readonly versionControlRepoName?: string;
}

export type CalmsTypescriptBaseOptionsWithDefaults = {
  defaultReleaseBranch: string;
  name: string;
  repository: string;
  typescriptExecutor: TypescriptExecutor;
  versionControlRepoName: string;
} & CalmsTypescriptBaseOptions;

export class CalmsTypescriptBase extends typescript.TypeScriptProject {
  // Note: Commented out CalmsEslint due to existing task conflicts
  // public readonly calmsEslint: CalmsEslint;

  public readonly copilotInstructions: CopilotInstructions;

  public readonly copilotSetupWorkflow?: CopilotSetupWorkflow;

  public readonly defaultTask: Task;

  public readonly husky: Husky;

  public readonly typescriptExecutor: TypescriptExecutor;

  public readonly updateSnapshotsWorkflow?: UpdateSnapshotsWorkflow;

  public readonly vitest: Vitest;

  constructor(options: CalmsTypescriptBaseOptions) {
    const versionControlRepoName =
      options.versionControlRepoName ?? options.packageJsonName;

    const defaultOptions: CalmsTypescriptBaseOptionsWithDefaults = {
      authorEmail: 'mostcolm@gmail.com',
      authorName: 'Alex Wendte',
      defaultReleaseBranch: 'main',
      github: true,
      githubOptions: {
        mergify: true,
        pullRequestLint: true,
      },
      name: options.packageJsonName,
      packageManager: NodePackageManager.PNPM,
      prettier: true,
      prettierOptions: {
        settings: {
          arrowParens: ArrowParens.AVOID,
          endOfLine: EndOfLine.LF,
          printWidth: 120,
          singleQuote: true,
          trailingComma: TrailingComma.ALL,
        },
      },
      projenrcTs: true,
      release: true,
      repository: `https://github.com/hbict/${versionControlRepoName}.git`,
      sampleCode: false,
      srcdir: 'src',
      testdir: '__tests__',
      tsconfig: {
        compilerOptions: {
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

    // Set up default pre-compile task to clean build directory
    this.preCompileTask.reset('rimraf build');

    // Note: Commented out CalmsEslint due to task conflicts - this is an existing issue
    // that needs to be resolved separately from the copilot instructions feature
    // this.calmsEslint = new CalmsEslint(this);

    this.vitest = new Vitest(this);

    this.husky = new Husky(this);

    this.copilotInstructions = new CopilotInstructions(this);

    if (this.github) {
      this.copilotSetupWorkflow = new CopilotSetupWorkflow(this);

      this.updateSnapshotsWorkflow = new UpdateSnapshotsWorkflow(this);

      new github.AutoQueue(this, {
        labels: ['auto-approve'],
        targetBranches: ['main'],
      });

      // Add default repository instructions
      new ManagedTextFile(this, '.github/copilot-instructions.md', {
        lines: [
          '# Copilot Instructions for CTT (Calm\'s TypeScript Templates)',
          '',
          '## Repository Summary',
          '',
          '**CTT (Calm\'s TypeScript Templates)** is a projen-based TypeScript project that provides templates and scaffolding tools for creating TypeScript applications and packages. It generates consistent project structures with preconfigured tools for linting, testing, building, and continuous integration.',
          '',
          '## Using CTT Templates',
          '',
          '### Quick Start',
          '',
          '```bash',
          '# Install CTT globally or use npx',
          'npm install -g @calm/ctt',
          '# OR',
          'npx @calm/ctt',
          '',
          '# Create a new project',
          'ctt my-project',
          '```',
          '',
          '### Available Templates',
          '',
          '- **CalmsTypescriptBase**: Base TypeScript project with common setup',
          '- **CalmsTypescriptPackage**: npm package with bin scripts and publishing setup',
          '- **CalmsTypescriptApp**: Application template with runtime optimizations',
          '- **CalmsTypescriptCdk**: AWS CDK application template',
          '',
          '### Development Workflow',
          '',
          '1. **Install dependencies**: `pnpm install`',
          '2. **Build**: `pnpm run build` or `npx projen build`',
          '3. **Test**: `pnpm test` or `npx projen test`',
          '4. **Lint**: `pnpm run lint` or `npx projen lint`',
          '',
          '## Projen Integration',
          '',
          'This project uses **projen** for project configuration and file generation.',
          '',
          '### Key Concepts',
          '',
          '- **`.projenrc.ts`**: Main configuration file that defines the project structure',
          '- **Projen Components**: Reusable pieces that add functionality (like Husky, Vitest, ESLint)',
          '- **Self-mutation**: Projen automatically updates generated files when configuration changes',
          '',
          '### Working with Projen',
          '',
          '```bash',
          '# Regenerate files after .projenrc.ts changes',
          'npx projen',
          '',
          '# Add new dependencies',
          '# Edit .projenrc.ts, then run projen to update package.json',
          '',
          '# Create new tasks',
          '# Define in .projenrc.ts components, access via this.myTask in classes',
          '```',
          '',
          '### Component Development Guidelines',
          '',
          '- Extend `Component` class for reusable functionality',
          '- Store task references as public readonly properties',
          '- Follow the existing patterns in `src/` directory',
          '- Use optional chaining (`?.`) for safer property access',
          '',
          '## Build System',
          '',
          '- **Package Manager**: pnpm with workspaces',
          '- **Compiler**: TypeScript with Node16 module resolution',
          '- **Test Runner**: Vitest with coverage',
          '- **Linter**: ESLint + Prettier with strict rules',
          '- **Git Hooks**: Husky for pre-commit and pre-push validation',
          '',
          '## Contributing',
          '',
          '1. Make changes to `.projenrc.ts` or `src/` files',
          '2. Run `npx projen` to regenerate configuration files',
          '3. Test your changes with `pnpm run build`',
          '4. Commit using conventional commit format',
          '5. All changes are validated by CI/CD pipeline',
        ],
      });
    }

    this.tryRemoveFile('.npmrc');

    this.addFields({ pnpm: undefined });

    new ManagedTextFile(this, '.npmrc', { lines: ['resolution-mode=highest'] });
  }
}