import { Component } from 'projen';

import { CalmsProjectType, CalmsTypescriptBase } from './ctb';
import { ManagedJsonFile } from './managed-json-file';
import { ManagedTextFile } from './managed-text-file';

export class Husky extends Component {
  constructor(project: CalmsTypescriptBase) {
    super(project);

    project.addDevDeps(
      '@commitlint/cli',
      '@commitlint/config-conventional',
      'husky',
      'lint-staged',
    );

    if (project.calmsProjectType !== CalmsProjectType.Package) {
      project.addScripts({
        prepare: 'husky',
      });
    }

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
      lines: ['yarn commitlint --edit $1', ''],
    });

    new ManagedJsonFile(project, '.lintstagedrc.json', {
      obj: {
        '*.md': 'yarn prettier --write',
        '*.ts': 'yarn lint',
      },
    });

    new ManagedTextFile(project, '.husky/pre-commit', {
      commentSymbol: '#',
      lines: ['yarn lint-staged', 'yarn test:coverage', 'yarn compile', ''],
    });

    new ManagedTextFile(project, '.husky/pre-push', {
      commentSymbol: '#',
      lines: `#!/bin/sh

CYAN="\\033[1;36m"
RED="\\033[1;31m"
GREEN="\\033[1;32m"
RESET="\\033[0m"

# Run projen
echo "\${CYAN}Verifying there are no uncommitted projen changes\${RESET}"
yarn projen

# Check for git changes
if git diff --quiet; then
  echo "\${GREEN}✅ No changes detected. Proceeding with commit.\${RESET}"
  exit 0
else
  echo "\${RED}❌ ERROR: Running 'yarn projen' resulted in file changes.\${RESET}"
  echo "\${RED}❌ Please commit these changes before proceeding.\${RESET}"
  exit 1
fi

`.split('\n'),
    });
  }
}
