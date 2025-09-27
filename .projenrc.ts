import { CalmsTypescriptApp } from './packages/ctt/src/cta';
import { CalmsTypescriptBase } from './packages/ctt/src/ctb';
import { CalmsTypescriptCdk } from './packages/ctt/src/ctc';
import { CalmsTypescriptPackage } from './packages/ctt/src/ctp';
import { ManagedYamlFile } from './packages/ctt/src/managed-yaml-file';
import { TypescriptExecutor } from './packages/ctt/src/types';

// Root project is now a CalmsTypescriptBase instead of CalmsTypescriptPackage
const project = new CalmsTypescriptBase({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  packageJsonName: 'ctt-workspace',
  typescriptExecutor: TypescriptExecutor.Tsx,
  versionControlRepoName: 'ctt',
});

// Create pnpm-workspace.yaml for workspace configuration using ManagedYamlFile
new ManagedYamlFile(project, 'pnpm-workspace.yaml', {
  obj: {
    packages: ['packages/*', 'examples/*'],
  },
});

// Create packages/ctt directory with @calm/ctt package
const cttPackage = new CalmsTypescriptPackage({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  deps: ['@inquirer/prompts'],
  entrypoint: 'src/index.ts',
  outdir: 'packages/ctt',
  packageJsonName: '@calm/ctt',
  parent: project,
  typescriptExecutor: TypescriptExecutor.Tsx,
  versionControlRepoName: 'ctt',
});

// Remove types field from @calm/ctt package.json
cttPackage.addFields({ types: undefined });

// Example CalmsTypescriptApp
new CalmsTypescriptApp({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  devDeps: ['@calm/ctt@workspace:*'],
  github: false,
  outdir: 'examples/cta',
  packageJsonName: 'example-cta',
  parent: project,
  typescriptExecutor: TypescriptExecutor.Tsx,
});

// Example CalmsTypescriptPackage
new CalmsTypescriptPackage({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  devDeps: ['@calm/ctt@workspace:*'],
  github: false,
  outdir: 'examples/ctp',
  packageJsonName: 'example-ctp',
  parent: project,
  typescriptExecutor: TypescriptExecutor.Tsx,
});

// Example CalmsTypescriptCdk
new CalmsTypescriptCdk({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  devDeps: ['@calm/ctt@workspace:*'],
  github: false,
  outdir: 'examples/ctc',
  packageJsonName: 'example-ctc',
  parent: project,
  typescriptExecutor: TypescriptExecutor.Tsx,
});

project.synth();
