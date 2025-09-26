import { synthSnapshot } from 'projen/lib/util/synth';
import { describe, expect, it } from 'vitest';

import { CalmsTypescriptPackage } from '../src';

const baseRequiredFileNames = [
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
  'eslint.config.mjs',
  'LICENSE',
  'package.json',
  'README.md',
  'tsconfig.json',
  'vitest.config.mts',
];

describe('CalmsTypescriptPackage', () => {
  describe('with default bin scripts', () => {
    const project = new CalmsTypescriptPackage({
      authorEmail: 'authorEmail',
      authorName: 'authorName',
      packageJsonName: 'test-package',
    });
    const snapshot = synthSnapshot(project);
    const requiredFileNames = [
      ...baseRequiredFileNames,
      'bin/test-package.ts',
      'src/cli/test-package.ts',
    ];

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

  describe('with scoped package name', () => {
    const project = new CalmsTypescriptPackage({
      authorEmail: 'authorEmail',
      authorName: 'authorName',
      packageJsonName: '@scope/test-package',
    });
    const snapshot = synthSnapshot(project);
    const requiredFileNames = [
      ...baseRequiredFileNames,
      'bin/test-package.ts',
      'src/cli/test-package.ts',
    ];

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

  describe('with shouldAddBinScripts set to false', () => {
    const project = new CalmsTypescriptPackage({
      authorEmail: 'authorEmail',
      authorName: 'authorName',
      packageJsonName: 'test-package',
      shouldAddBinScripts: false,
    });
    const snapshot = synthSnapshot(project);
    const requiredFileNames = baseRequiredFileNames;

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

  describe('with custom bin script names', () => {
    const project = new CalmsTypescriptPackage({
      authorEmail: 'authorEmail',
      authorName: 'authorName',
      binScriptNames: ['cli1', 'cli2'],
      packageJsonName: 'test-package',
    });
    const snapshot = synthSnapshot(project);
    const requiredFileNames = [
      ...baseRequiredFileNames,
      'bin/cli1.ts',
      'bin/cli2.ts',
      'bin/test-package.ts',
      'src/cli/cli1.ts',
      'src/cli/cli2.ts',
      'src/cli/test-package.ts',
    ];

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
});
