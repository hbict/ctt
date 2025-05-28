import { CalmTypescriptPackage } from './src/ctp';
const project = new CalmTypescriptPackage({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  name: '@calm/ctt',
  repository: 'https://github.com/alexwendte/ctt.git',
});
project.synth();
