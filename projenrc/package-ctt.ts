import type { Task } from 'projen';

import { TypeScriptProject } from 'projen/lib/typescript';

import { CalmsTypescriptPackage } from '../packages/ctt/src/ctp';
import { ManagedTextFile } from '../packages/ctt/src/managed-text-file';
import { TypescriptExecutor } from '../packages/ctt/src/types';

export class PackageCtt extends CalmsTypescriptPackage {
  public readonly e2eTestTask: Task;

  constructor(parent: TypeScriptProject) {
    super({
      authorEmail: 'mostcolm@gmail.com',
      authorName: 'Alex Wendte',
      deps: ['@inquirer/prompts', 'commander'],
      entrypoint: 'src/index.ts',
      outdir: 'packages/ctt',
      packageJsonName: '@hbict/ctt',
      parent,
      typescriptExecutor: TypescriptExecutor.Tsx,
      versionControlRepoName: 'ctt',
    });

    this.addFields({ types: undefined });

    // Include e2e tests in TypeScript compilation
    this.tsconfig?.addInclude('e2e/**/*.ts');
    this.tsconfig?.addInclude('e2e/vitest.config.mts');

    // Create e2e vitest config
    new ManagedTextFile(this, 'e2e/vitest.config.mts', {
      lines: [
        '// E2E test configuration',
        "import { defineConfig } from 'vitest/config';",
        '',
        'export default defineConfig({',
        '  test: {',
        '    clearMocks: false,',
        "    exclude: ['**/dist/**', '**/build/**', '**/node_modules/**'],",
        "    include: ['**/*-e2e-test.ts?(x)'],",
        '    mockReset: true,',
        '    restoreMocks: false,',
        '  },',
        '});',
      ],
    });

    this.e2eTestTask = this.addTask('test:e2e', {
      description: 'Run e2e tests',
      exec: 'vitest run --config e2e/vitest.config.mts',
    });
  }
}
