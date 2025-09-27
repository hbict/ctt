import { TypeScriptProject } from 'projen/lib/typescript';

import { CalmsTypescriptBase } from '../packages/ctt/src/ctb';
import { TypescriptExecutor } from '../packages/ctt/src/types';

export class ExampleCta extends CalmsTypescriptBase {
  constructor(parent: TypeScriptProject) {
    super({
      authorEmail: 'mostcolm@gmail.com',
      authorName: 'Alex Wendte',
      devDeps: ['@calm/ctt@workspace:*'],
      github: false,
      outdir: 'examples/cta',
      packageJsonName: 'example-cta',
      parent,
      typescriptExecutor: TypescriptExecutor.Tsx,
    });
  }
}
