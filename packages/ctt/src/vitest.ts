import { Component, Task } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

import { ManagedTextFile } from './managed-text-file';

export class Vitest extends Component {
  public readonly testCoverageTask: Task;

  public readonly testWatchTask: Task;

  public readonly updateSnapshotsTask: Task;

  constructor(project: TypeScriptProject) {
    super(project);

    project.addDevDeps('vitest', '@vitest/coverage-v8');

    project.tsconfig?.addInclude('vitest.config.mts');

    project.gitignore.addPatterns('test-reports/');

    // needs to be .mts since we are using module NodeNext
    new ManagedTextFile(project, 'vitest.config.mts', {
      lines: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/dist/**', '**/lib/**', '**/node_modules/**'],
    globals: true,
    include: ['**/*.test.ts?(x)'],
  },
});
`.split('\n'),
    });

    // don't want the test script to update snapshots and want to run coverage since this is what is used in the build
    project.testTask.spawn(
      new Task('test:coverage', {
        receiveArgs: true,
      }),
      {
        receiveArgs: true,
      },
    );

    // we want our actual test script to not run with coverage
    project.removeScript('test');

    // want to still have a package.json script for `test`
    project.addScripts({
      test: 'vitest run --passWithNoTests',
      'test:watch': 'npx projen test:watch',
    });

    this.testCoverageTask = project.tasks.tryFind('test:coverage') || project.addTask('test:coverage', {
      description: 'run tests with coverage',
      exec: 'vitest run --passWithNoTests --coverage',
      receiveArgs: true,
    });

    this.testWatchTask = project.tasks.tryFind('test:watch') || project.addTask('test:watch', {
      description: 'run tests in watch mode',
      exec: 'vitest',
      receiveArgs: true,
    });

    this.updateSnapshotsTask = project.tasks.tryFind('test:update-snapshots') || project.addTask('test:update-snapshots', {
      description: 'run tests and update snapshots',
      exec: 'vitest run ---u',
      receiveArgs: true,
    });
  }
}
