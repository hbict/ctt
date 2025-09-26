import { TextFile } from 'projen';

import { CalmsTypescriptPackage } from './src/ctp';
import { TypescriptExecutor } from './src/types';

const project = new CalmsTypescriptPackage({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  deps: ['@inquirer/prompts'],
  entrypoint: 'src/index.ts', // Change main entry to src/index.ts
  packageJsonName: '@calm/ctt',
  typescriptExecutor: TypescriptExecutor.Tsx,
  versionControlRepoName: 'ctt',
});

// Remove types field from package.json
project.addFields({ types: undefined });

// Add examples to .gitignore so they don't get linted as part of main project
project.addGitIgnore('examples/');

// Create pnpm-workspace.yaml for workspace configuration
new TextFile(project, 'pnpm-workspace.yaml', {
  lines: ['packages:', '  - "examples/*"'],
});

project.synth();
