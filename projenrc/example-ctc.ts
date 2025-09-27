import { TypeScriptProject } from 'projen/lib/typescript';

import { CalmsTypescriptCdk } from '../packages/ctt/src/ctc';
import { TypescriptExecutor } from '../packages/ctt/src/types';

export class ExampleCtc extends CalmsTypescriptCdk {
  constructor(parent: TypeScriptProject) {
    super({
      authorEmail: 'mostcolm@gmail.com',
      authorName: 'Alex Wendte',
      devDeps: ['@calm/ctt@workspace:*'],
      github: false,
      outdir: 'examples/ctc',
      packageJsonName: 'example-ctc',
      parent,
      typescriptExecutor: TypescriptExecutor.Tsx,
    });
  }
}
