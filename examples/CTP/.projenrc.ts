import { CalmsTypescriptPackage } from '../../packages/ctt/src/ctp';
import { TypescriptExecutor } from '../../packages/ctt/src/types';

const project = new CalmsTypescriptPackage({
  authorEmail: 'mostcolm@gmail.com',
  authorName: 'Alex Wendte',
  packageJsonName: 'example-ctp',
  devDeps: ['@calm/ctt@workspace:*'],
  typescriptExecutor: TypescriptExecutor.Tsx,
  github: false,
});

project.synth();
