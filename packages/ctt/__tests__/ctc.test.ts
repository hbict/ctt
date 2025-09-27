import { synthSnapshot } from 'projen/lib/util/synth';
import { describe, expect, it } from 'vitest';

import { CalmsTypescriptCdk } from '../src';

const requiredFileNames = [
  '.commitlintrc.json',
  '.gitattributes',
  '.github/pull_request_template.md',
  '.github/workflows/auto-queue.yml',
  '.github/workflows/build.yml',
  '.github/workflows/copilot-setup-steps.yml',
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
  '.npmrc',
  '.prettierignore',
  '.prettierrc.json',
  '.projen/deps.json',
  '.projen/files.json',
  '.projen/tasks.json',
  'LICENSE',
  'README.md',
  'cdk.json',
  'eslint.config.mjs',
  'package.json',
  'tsconfig.json',
  'vitest.config.mts',
];

describe('CalmsTypescriptCdk', () => {
  const project = new CalmsTypescriptCdk({
    authorEmail: 'authorEmail',
    authorName: 'authorName',
    packageJsonName: 'test-cdk-project',
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
