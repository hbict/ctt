import type { Linter } from 'eslint';

import { Component, Task } from 'projen';
import { NodeProject } from 'projen/lib/javascript';

import { defaultRules } from './eslint';
import { ManagedTextFile } from './managed-text-file';

export class CalmsEslint extends Component {
  public readonly lintTask: Task;

  /**
   * Get merged rules (default + custom).
   */
  public get rules(): Map<string, Linter.RuleEntry | null> {
    const merged = new Map(this.defaultRules);
    this.customRules.forEach((value, key) => {
      merged.set(key, value);
    });
    return merged;
  }

  private readonly customRules: Map<string, Linter.RuleEntry | null> = new Map();

  private readonly defaultRules: Map<string, Linter.RuleEntry | null>;

  constructor(project: NodeProject) {
    super(project);

    this.defaultRules = new Map(Object.entries(defaultRules));

    project.deps.removeDependency('@typescript');

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

    this.lintTask = project.addTask('lint', {
      description: 'Runs prettier eslint against the codebase',
      exec: 'prettier --write --no-error-on-unmatched-pattern **/*.{ts,tsx} --ignore-path .gitignore',
      receiveArgs: true,
    });

    this.lintTask.exec(
      'eslint . --ext .ts,tsx -c ./eslint.config.mjs --fix --no-error-on-unmatched-pattern',
      { receiveArgs: true },
    );
  }

  /**
   * Add eslint rules.
   */
  public addRules(rules: Record<string, Linter.RuleEntry | null>): void {
    Object.entries(rules).forEach(([key, value]) => {
      this.customRules.set(key, value);
    });
  }

  public preSynthesize(): void {
    super.preSynthesize();

    const project = this.project as NodeProject;
    const calmsEslintMjs = this.generateConfig();

    new ManagedTextFile(project, 'eslint.config.mjs', {
      lines: calmsEslintMjs.split('\n'),
    });
  }

  private generateConfig(): string {
    const mergedRules = this.renderMergedRules();

    return `import eslint from '@eslint/js';
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
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: ${mergedRules},
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
  globalIgnores([
    '**/build/*',
    '**/coverage/*',
    '**/node_modules/*',
    '**/eslint.config.mjs',
    '**/vitest.config.mts',
  ]),
);
`;
  }

  private renderMergedRules(): string {
    const rulesObj = Object.fromEntries(this.rules);
    return JSON.stringify(rulesObj, null, 2);
  }
}
