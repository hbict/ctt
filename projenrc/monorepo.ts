import { CalmsTypescriptBase } from '../packages/ctt/src/ctb';
import { ManagedYamlFile } from '../packages/ctt/src/managed-yaml-file';
import { TypescriptExecutor } from '../packages/ctt/src/types';

export class Monorepo extends CalmsTypescriptBase {
  constructor() {
    super({
      authorEmail: 'mostcolm@gmail.com',
      authorName: 'Alex Wendte',
      packageJsonName: 'ctt',
      typescriptExecutor: TypescriptExecutor.Tsx,
      versionControlRepoName: 'ctt',
    });

    // we are @hbict/ctt so we need to use it differently
    this.deps.removeDependency('@hbict/ctt');
    this.addDevDeps('@hbict/ctt@workspace:*');

    new ManagedYamlFile(this, 'pnpm-workspace.yaml', {
      obj: {
        packages: ['packages/*', 'examples/*'],
      },
    });
  }
}
