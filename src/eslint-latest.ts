import { Task } from 'projen';
import { Eslint, EslintOptions, NodeProject } from 'projen/lib/javascript';
import { merge } from 'ts-deepmerge';

import { ManagedTextFile } from './managed-text-file';

export class EslintLatest extends Eslint {
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
      'typescript-eslint',
    );

    project.tryRemoveFile('.eslintrc.json');

    new ManagedTextFile(project, 'eslint.config.mjs', {
      lines: eslintLatestMjs.split('\n'),
    });

    // remove eslint spawn
    project.testTask.removeStep(0);

    // no longer needed as we will use a more generic `lint` task
    project.removeTask('eslint');

    const lintTask = project.addTask('lint', {
      description: 'Runs prettier eslint against the codebase',
      exec: 'prettier --write --no-error-on-unmatched-pattern $@ "{src,__tests__,projenrc}/**/*.ts" .projenrc.ts README.md',
      receiveArgs: true,
    });

    lintTask.exec(
      'yarn eslint --ext .ts --fix --no-error-on-unmatched-pattern $@ src __tests__ projenrc .projenrc.ts',
      { receiveArgs: true },
    );

    // want to add the lint task back to the test task for the build pipeline
    project.testTask.spawn(new Task('lint', { receiveArgs: true }), {
      receiveArgs: true,
    });
  }
}

const eslintLatestMjs = `import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import functional from 'eslint-plugin-functional';
import importPlugin from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default tseslint.config(
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
    rules: {
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/brace-style': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': 'off',
      '@stylistic/semi': ['error', 'always'],
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowBoolean: true,
          allowNever: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],
      'functional/immutable-data': [
        'error',
        { ignoreClasses: 'fieldsOnly', ignoreMapsAndSets: true },
      ],
      'functional/no-let': 'error',
      'import/export': 'off',
      'import/no-unresolved': [
        'error',
        {
          ignore: ['aws-lambda', 'vitest/config'],
        },
      ],
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'no-nested-ternary': 'error',
      'no-template-curly-in-string': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.int-test.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
  globalIgnores(['**/dist/*', '**/lib/*', 'eslint.config.mjs', 'types/*']),
);
`;
