import { TypeScriptProject } from 'projen/lib/typescript';

import { CalmsTypescriptPackage } from '../packages/ctt/src/ctp';
import { TypescriptExecutor } from '../packages/ctt/src/types';

export class ExampleCtp extends CalmsTypescriptPackage {
  constructor(parent: TypeScriptProject) {
    super({
      authorEmail: 'mostcolm@gmail.com',
      authorName: 'Alex Wendte',
      devDeps: ['@calm/ctt@workspace:*'],
      github: false,
      outdir: 'examples/ctp',
      packageJsonName: 'example-ctp',
      parent,
      typescriptExecutor: TypescriptExecutor.Tsx,
    });
  }
}
