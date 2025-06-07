import { CalmsTypescriptPackage } from './src/ctp';
const project = new CalmsTypescriptPackage({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  deps: ['@inquirer/prompts'],
  packageJsonName: '@calm/ctt',
  repository: 'https://github.com/hbict/ctt.git',
});
project.synth();
