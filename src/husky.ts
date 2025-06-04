import { Component } from 'projen';
import { NodeProject } from 'projen/lib/javascript';

import { ManagedJsonFile } from './managed-json-file';
import { ManagedTextFile } from './managed-text-file';

export class Husky extends Component {
  constructor(project: NodeProject) {
    super(project);

    project.addDevDeps(
      '@commitlint/cli',
      '@commitlint/config-conventional',
      'husky',
      'lint-staged',
    );

    project.addScripts({
      postinstall: 'husky',
    });

    new ManagedJsonFile(project, '.commitlintrc.json', {
      obj: {
        extends: ['@commitlint/config-conventional'],
        rules: {
          'body-leading-blank': [2, 'always'],
        },
      },
    });

    new ManagedTextFile(project, '.husky/commit-msg', {
      commentSymbol: '#',
      lines: ['yarn commitlint --edit $1', '\n'],
    });

    new ManagedJsonFile(project, '.lintstagedrc.json', {
      obj: {
        '*.md': 'yarn prettier --write',
        '*.ts': 'yarn lint',
      },
    });

    new ManagedTextFile(project, '.husky/pre-commit', {
      commentSymbol: '#',
      lines: ['yarn lint-staged', 'yarn test:coverage', '\n'],
    });

    new ManagedTextFile(project, '.husky/pre-push', {
      commentSymbol: '#',
      lines: [
        'echo "make sure the project is not out of sync with .projenrc.ts"',
        '\n',
      ],
    });
  }
}
