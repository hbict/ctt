import { TypeScriptProject } from 'projen/lib/typescript';

import { CalmsTypescriptBase } from '../packages/ctt/src/ctb';
import { TypescriptExecutor } from '../packages/ctt/src/types';

export class ExampleCta extends CalmsTypescriptBase {
  constructor(parent: TypeScriptProject) {
    super({
      authorEmail: 'mostcolm@gmail.com',
      authorName: 'Alex Wendte',
      devDeps: ['@hbict/ctt@workspace:*'],
      github: false,
      outdir: 'examples/cta',
      packageJsonName: 'example-cta',
      parent,
      typescriptExecutor: TypescriptExecutor.Tsx,
    });

    // testing out eslint overrides
    this.calmsEslint.addRules({ 'perfectionist/sort-modules': 'off' });

    // we are @hbict/ctt so we need to use it differently
    this.deps.removeDependency('@hbict/ctt');
    this.addDevDeps('@hbict/ctt@workspace:*');
  }
}
