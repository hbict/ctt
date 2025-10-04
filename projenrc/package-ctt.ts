import { TypeScriptProject } from 'projen/lib/typescript';

import { CalmsTypescriptPackage } from '../packages/ctt/src/ctp';
import { TypescriptExecutor } from '../packages/ctt/src/types';

export class PackageCtt extends CalmsTypescriptPackage {
  constructor(parent: TypeScriptProject) {
    super({
      authorEmail: 'mostcolm@gmail.com',
      authorName: 'Alex Wendte',
      deps: ['@inquirer/prompts'],
      entrypoint: 'src/index.ts',
      outdir: 'packages/ctt',
      packageJsonName: '@hbict/ctt',
      parent,
      typescriptExecutor: TypescriptExecutor.Tsx,
      versionControlRepoName: 'ctt',
    });

    this.addFields({ types: undefined });
  }
}
