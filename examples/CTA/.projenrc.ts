import { CalmsTypescriptApp } from '../../packages/ctt/src/cta';
import { TypescriptExecutor } from '../../packages/ctt/src/types';

const project = new CalmsTypescriptApp({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  packageJsonName: 'example-cta',
  devDeps: ['@calm/ctt@workspace:*'],
  typescriptExecutor: TypescriptExecutor.Tsx,
  github: false,
});

project.synth();
