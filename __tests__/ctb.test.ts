import { synthSnapshot } from 'projen/lib/util/synth';

import { CalmsTypescriptBase } from '../src';

const requiredFileNames = [
  '.commitlintrc.json',
  '.gitattributes',
  '.github/pull_request_template.md',
  '.github/workflows/auto-queue.yml',
  '.github/workflows/build.yml',
  '.github/workflows/pull-request-lint.yml',
  '.github/workflows/release.yml',
  '.github/workflows/update-snapshots.yml',
  '.github/workflows/upgrade-main.yml',
  '.gitignore',
  '.husky/commit-msg',
  '.husky/pre-commit',
  '.husky/pre-push',
  '.lintstagedrc.json',
  '.mergify.yml',
  '.npmignore',
  '.prettierignore',
  '.prettierrc.json',
  '.projen/deps.json',
  '.projen/files.json',
  '.projen/tasks.json',
  'eslint.config.mjs',
  'LICENSE',
  'package.json',
  'README.md',
  'tsconfig.json',
  'types/vite.d.ts',
  'vitest.config.mts',
];

describe('CalmsTypescriptBase', () => {
  const project = new CalmsTypescriptBase({
    authorEmail: 'authorEmail',
    authorName: 'authorName',
    packageJsonName: 'test-project',
    repository: 'https://github.com/hbict/repository.git',
  });
  const snapshot = synthSnapshot(project);

  it.each(requiredFileNames)(
    'should include the required file: %s',
    fileName => {
      expect(Object.keys(snapshot)).toContain(fileName);
    },
  );

  it('should not generate any files other than the required files', () => {
    const generatedFiles = Object.keys(snapshot);
    const unexpectedFiles = generatedFiles.filter(
      file => !requiredFileNames.includes(file),
    );

    expect(unexpectedFiles).toEqual([]);
  });

  it.each(requiredFileNames)(
    'should have the correct contents for the required file: %s',
    fileName => {
      expect(snapshot[fileName]).toMatchSnapshot();
    },
  );
});
