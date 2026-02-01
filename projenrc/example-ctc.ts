import { TypeScriptProject } from 'projen/lib/typescript';

import { CalmsTypescriptCdk } from '../packages/ctt/src/ctc';
import { TypescriptExecutor } from '../packages/ctt/src/types';

export class ExampleCtc extends CalmsTypescriptCdk {
  constructor(parent: TypeScriptProject) {
    super({
      authorEmail: 'mostcolm@gmail.com',
      authorName: 'Alex Wendte',
      devDeps: ['@hbict/ctt@workspace:*'],
      github: false,
      outdir: 'examples/ctc',
      packageJsonName: 'example-ctc',
      parent,
      typescriptExecutor: TypescriptExecutor.Tsx,
    });

    // we are @hbict/ctt so we need to use it differently
    this.deps.removeDependency('@hbict/ctt');
    this.addDevDeps('@hbict/ctt@workspace:*');
  }
}
