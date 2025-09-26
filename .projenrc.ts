import { CalmsTypescriptPackage } from './src/ctp';
import { TypescriptExecutor } from './src/types';

const project = new CalmsTypescriptPackage({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  deps: ['@inquirer/prompts'],
  packageJsonName: '@calm/ctt',
  typescriptExecutor: TypescriptExecutor.Tsx,
  versionControlRepoName: 'ctt',
});

project.synth();
