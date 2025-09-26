import { Task } from 'projen';
import { Eslint, EslintOptions, NodeProject } from 'projen/lib/javascript';
import { merge } from 'ts-deepmerge';

import { customTextRules } from './eslint';
import { ManagedTextFile } from './managed-text-file';

const calmsEslintMjs = `import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import functional from 'eslint-plugin-functional';
import importPlugin from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  tseslint.configs.strictTypeChecked,
  perfectionist.configs['recommended-alphabetical'],
  stylistic.configs.recommended,
  functional.configs.off,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: ${customTextRules},
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.int-test.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
  globalIgnores(['**/build/*', '**/coverage/*', '**/node_modules/*', 'eslint.config.mjs']),
);
`;

export class CalmsEslint extends Eslint {
  constructor(project: NodeProject, options?: EslintOptions) {
    const defaultOptions: EslintOptions = {
      dirs: [],
    };

    const mergedOptions = merge(defaultOptions, options || {});

    super(project, mergedOptions);

    project.deps.removeDependency('@typescript-eslint');
    project.deps.removeDependency('@typescript');
    project.deps.removeDependency('eslint');
    project.deps.removeDependency('eslint-config-prettier');
    project.deps.removeDependency('eslint-import-resolver-typescript');
    project.deps.removeDependency('eslint-plugin-import');
    project.deps.removeDependency('eslint-plugin-prettier');

    project.addDevDeps(
      '@eslint/js',
      '@stylistic/eslint-plugin',
      'eslint',
      'eslint-plugin-functional',
      'eslint-plugin-import',
      'eslint-plugin-perfectionist',
      'eslint-import-resolver-typescript',
      'typescript-eslint',
    );

    project.tryRemoveFile('.eslintrc.json');

    new ManagedTextFile(project, 'eslint.config.mjs', {
      lines: calmsEslintMjs.split('\n'),
    });

    // remove eslint spawn
    project.testTask.removeStep(0);

    // no longer needed as we will use a more generic `lint` task
    project.removeTask('eslint');

    const lintTask = project.addTask('lint', {
      description: 'Runs prettier eslint against the codebase',
      exec: 'prettier --write --no-error-on-unmatched-pattern **/*.{ts,tsx} --ignore-path .gitignore',
      receiveArgs: true,
    });

    lintTask.exec(
      'eslint . --ext .ts,tsx -c ./eslint.config.mjs --fix --no-error-on-unmatched-pattern',
      { receiveArgs: true },
    );

    // want to add the lint task back to the test task for the build pipeline
    project.testTask.spawn(new Task('lint', { receiveArgs: true }), {
      receiveArgs: true,
    });
  }
}
