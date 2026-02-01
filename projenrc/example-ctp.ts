import { TypeScriptProject } from 'projen/lib/typescript';

import { CalmsTypescriptPackage } from '../packages/ctt/src/ctp';
import { TypescriptExecutor } from '../packages/ctt/src/types';

export class ExampleCtp extends CalmsTypescriptPackage {
  constructor(parent: TypeScriptProject) {
    super({
      authorEmail: 'mostcolm@gmail.com',
      authorName: 'Alex Wendte',
      devDeps: ['@hbict/ctt@workspace:*'],
      github: false,
      outdir: 'examples/ctp',
      packageJsonName: 'example-ctp',
      parent,
      typescriptExecutor: TypescriptExecutor.Tsx,
    });

    // we are @hbict/ctt so we need to use it differently
    this.deps.removeDependency('@hbict/ctt');
    this.addDevDeps('@hbict/ctt@workspace:*');
  }
}
