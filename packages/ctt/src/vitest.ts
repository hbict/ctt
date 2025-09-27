import { Component, Task } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

import { ManagedTextFile } from './managed-text-file';

export class Vitest extends Component {
  public readonly testWatchTask: Task;

  public readonly updateSnapshotsTask: Task;

  constructor(
    project: {
      lintTask: Task;
    } & TypeScriptProject,
  ) {
    super(project);

    project.addDevDeps('vitest', '@vitest/coverage-v8');

    project.tsconfig?.addInclude('vitest.config.mts');

    project.gitignore.addPatterns('test-reports/');

    // needs to be .mts since we are using module NodeNext
    new ManagedTextFile(project, 'vitest.config.mts', {
      lines: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    clearMocks: false,
    exclude: ['**/dist/**', '**/build/**', '**/node_modules/**'],
    include: ['**/*.test.ts?(x)'],
    mockReset: true,
    restoreMocks: false,
  },
});
`.split('\n'),
    });

    project.testTask.reset();

    project.testTask.spawn(project.lintTask, {
      receiveArgs: true,
    });

    project.testTask.exec('vitest run --coverage --pass-with-no-tests', {
      receiveArgs: true,
    });

    project.addScripts({ 'test:watch': 'npx projen test:watch' });

    this.testWatchTask = project.addTask('test:watch', {
      description: 'run tests in watch mode',
      exec: 'vitest',
      receiveArgs: true,
    });

    this.updateSnapshotsTask = project.addTask('test:update-snapshots', {
      description: 'run tests and update snapshots',
      exec: 'vitest run ---u',
      receiveArgs: true,
    });
  }
}
