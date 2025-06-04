import { Component, Task } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

import { ManagedTextFile } from './managed-text-file';

export class Vitest extends Component {
  constructor(project: TypeScriptProject) {
    super(project);

    project.addDevDeps('vitest', '@vitest/coverage-v8');

    project.tsconfig?.addInclude('vitest.config.ts');

    project.gitignore.addPatterns('test-reports');

    new ManagedTextFile(project, 'vitest.config.ts', {
      lines: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
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
    });

    project.addTask('test:coverage', {
      description: 'run tests with coverage',
      exec: 'vitest run --passWithNoTests --coverage',
      receiveArgs: true,
    });

    project.tasks.tryFind('test:watch')?.reset('vitest', { receiveArgs: true });
  }
}
