import { synthSnapshot } from 'projen/lib/util/synth';
import { describe, expect, it } from 'vitest';

import { CalmsTypescriptBase } from '../src';

const requiredFileNames = [
  '.commitlintrc.json',
  '.gitattributes',
  '.github/copilot-instructions.md',
  '.github/instructions/test.instructions.md',
  '.github/instructions/typescript.instructions.md',
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

describe('CalmsTypescriptBase', () => {
  const project = new CalmsTypescriptBase({
    authorEmail: 'authorEmail',
    authorName: 'authorName',
    packageJsonName: 'test-project',
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

  describe('CopilotInstructions integration', () => {
    it('should provide access to copilot instructions component', () => {
      expect(project.copilotInstructions).toBeDefined();
      expect(project.copilotInstructions.typescriptInstruction).toBeDefined();
      expect(project.copilotInstructions.testInstruction).toBeDefined();
    });

    it('should allow adding new instructions', () => {
      const customInstruction = project.copilotInstructions.add({
        name: 'integration-test',
        appliesTo: '**/*.integration.ts',
        content: 'Integration test instruction content',
      });

      expect(customInstruction).toBeDefined();
      expect(project.copilotInstructions.tryFind('integration-test')).toBe(customInstruction);
    });

    it('should create default typescript instruction with expected content', () => {
      const typescriptContent = snapshot['.github/instructions/typescript.instructions.md'];
      expect(typescriptContent).toContain('# typescript');
      expect(typescriptContent).toContain('Applies to: `**/*.ts, **/*.tsx`');
      expect(typescriptContent).toContain('Optional Chaining');
      expect(typescriptContent).toContain('Type Safety');
    });

    it('should create default test instruction with expected content', () => {
      const testContent = snapshot['.github/instructions/test.instructions.md'];
      expect(testContent).toContain('# test');
      expect(testContent).toContain('Applies to: `**/*.test.ts, **/*-test.ts`');
      expect(testContent).toContain('Never Test Implementation Details');
      expect(testContent).toContain('Use Snapshot Tests for Generated Files');
    });

    it('should create repository copilot instructions with expected content', () => {
      const repoContent = snapshot['.github/copilot-instructions.md'];
      expect(repoContent).toContain('# Copilot Instructions for CTT');
      expect(repoContent).toContain('Using CTT Templates');
      expect(repoContent).toContain('Projen Integration');
      expect(repoContent).toContain('CalmsTypescriptBase');
      expect(repoContent).toContain('CalmsTypescriptPackage');
      expect(repoContent).toContain('CalmsTypescriptApp');
      expect(repoContent).toContain('CalmsTypescriptCdk');
    });
  });
});
