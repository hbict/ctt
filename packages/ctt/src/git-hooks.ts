import { Component } from 'projen';
import { NodeProject } from 'projen/lib/javascript';

import { ManagedJsonFile } from './managed-json-file';
import { ManagedTextFile } from './managed-text-file';

export class GitHooks extends Component {
  constructor(
    project: {
      runBinaryCommand: string;
    } & NodeProject,
  ) {
    super(project);

    if (project.parent) {
      project.logger.debug('skipping husky steps for subproject');
      return;
    }

    project.addDevDeps(
      '@commitlint/cli',
      '@commitlint/config-conventional',
      'husky',
      'lint-staged',
    );

    project.addScripts({
      prepare: 'husky',
    });

    new ManagedJsonFile(project, '.commitlintrc.json', {
      obj: {
        extends: ['@commitlint/config-conventional'],
        rules: {
          'body-leading-blank': [2, 'always'],
        },
      },
    });

    new ManagedJsonFile(project, '.lintstagedrc.json', {
      obj: {
        '*.md': `${project.runBinaryCommand} prettier --write`,
        '*.ts': `${project.runScriptCommand} lint`,
      },
    });

    new ManagedTextFile(project, '.husky/commit-msg', {
      commentSymbol: '#',
      lines: ['set -e', `${project.runBinaryCommand} commitlint --edit $1`, ''],
      shebang: '#!/bin/sh',
    });

    new ManagedTextFile(project, '.husky/pre-commit', {
      commentSymbol: '#',
      lines: [
        'set -e',
        `${project.runBinaryCommand} lint-staged`,
        `${project.runScriptCommand} test`,
        `${project.runScriptCommand} compile`,
        '',
      ],
      shebang: '#!/bin/sh',
    });

    new ManagedTextFile(project, '.husky/pre-push', {
      commentSymbol: '#',
      lines: `set -e

lint

CYAN="\\033[1;36m"
RED="\\033[1;31m"
GREEN="\\033[1;32m"
RESET="\\033[0m"

# Run projen
echo "\${CYAN}Verifying there are no uncommitted projen changes\${RESET}"
${this.project.projenCommand}

# Check for git changes
if git diff --quiet; then
  echo "\${GREEN}✅ No changes detected. Proceeding with commit.\${RESET}"
  exit 0
else
  echo "\${RED}❌ ERROR: Running '${this.project.projenCommand}' resulted in file changes.\${RESET}"
  echo "\${RED}❌ Please commit these changes before proceeding.\${RESET}"
  exit 1
fi

`.split('\n'),
      shebang: '#!/bin/sh',
    });
  }
}
