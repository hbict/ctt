import { Component, Task } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

import { ManagedTextFile } from './managed-text-file';

export class Vitest extends Component {
  constructor(project: TypeScriptProject) {
    super(project);

    project.addDevDeps('vitest', '@vitest/coverage-v8');

    project.tsconfig?.addInclude('vitest.config.mts');

    project.tsconfig?.addInclude('types/**/*.ts');

    project.gitignore.addPatterns('test-reports/');

    // needs to be .mts since we are using module NodeNext
    new ManagedTextFile(project, 'vitest.config.mts', {
      lines: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/dist/**', '**/lib/**', '**/node_modules/**'],
    globals: true,
    include: ['**/*.{test}.[t]s?(x)'],
  },
});
`.split('\n'),
    });

    // required because vite depends on those 3 types which are only defined in the dom
    new ManagedTextFile(project, 'types/vite.d.ts', {
      lines: `declare interface Worker {}
declare interface WebSocket {}

declare namespace WebAssembly {
  interface Module {}
}
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
