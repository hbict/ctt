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
  'cdk.json',
  'eslint.config.mjs',
  'LICENSE',
  'package.json',
  'README.md',
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

  // Test basic functionality without content parsing since snapshots are working correctly
  it('should create a CDK project instance', () => {
    expect(project).toBeDefined();
    expect(project.constructor.name).toBe('CalmsTypescriptCdk');
  });

  it('should have CDK as dev dependencies', () => {
    const devDeps = project.deps.all.filter(
      dep =>
        dep.name === 'aws-cdk-lib' ||
        dep.name === 'aws-cdk' ||
        dep.name === 'rimraf',
    );
    expect(devDeps).toHaveLength(3);
  });

  it('should have custom tasks for CDK operations', () => {
    const taskNames = project.tasks.all.map(task => task.name);
    expect(taskNames).toContain('deploy');
    expect(taskNames).toContain('deploy:dev');
    expect(taskNames).toContain('deploy:uat');
    expect(taskNames).toContain('deploy:prod');
    expect(taskNames).toContain('pre-compile');
    expect(taskNames).toContain('post-compile');
  });
});
