import { synthSnapshot } from 'projen/lib/util/synth';

import { CalmTypescriptBase } from '../src';

const requiredFileNames = [
  '.commitlintrc.json',
  '.gitattributes',
  '.github/pull_request_template.md',
  '.github/workflows/build.yml',
  '.github/workflows/pull-request-lint.yml',
  '.github/workflows/release.yml',
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

describe('CalmTypescriptBase', () => {
  const project = new CalmTypescriptBase({ name: 'test-project' });
  const snapshot = synthSnapshot(project);

  test.each(requiredFileNames)(
    'should include the required file: %s',
    fileName => {
      expect(Object.keys(snapshot)).toContain(fileName);
    },
  );

  test('should not generate any files other than the required files', () => {
    const generatedFiles = Object.keys(snapshot);
    const unexpectedFiles = generatedFiles.filter(
      file => !requiredFileNames.includes(file),
    );

    expect(unexpectedFiles).toEqual([]);
  });
});
