import { SampleFile } from 'projen';
import { merge } from 'ts-deepmerge';

import { CalmsTypescriptBase, CalmsTypescriptBaseOptions } from './ctb';

export interface CalmsTypescriptPackageOptions
  extends CalmsTypescriptBaseOptions {
  /**
   * The scripts that will be added as bins to the package.json will be stubbed out for you to populate. Set shouldAddBinScripts to false to not include any bin scripts
   * @default [packageJsonName.after('/')]
   */
  binScriptNames?: string[];

  /**
   * Whether to set up bin scripts in the package.json and stub out the files for them
   * @default true
   */
  shouldAddBinScripts?: boolean;
}

export type CalmsTypescriptPackageOptionsWithDefaults = {
  binScriptNames: string[];
  entrypoint: string;
} & CalmsTypescriptPackageOptions;

export class CalmsTypescriptPackage extends CalmsTypescriptBase {
  public readonly bumpMajorTask;

  public readonly bumpMinorTask;

  public readonly bumpPatchTask;

  public readonly bumpPreMajorTask;

  public readonly bumpPreMinorTask;

  public readonly bumpPrePatchTask;

  public readonly publishOfficialTask;

  public readonly publishRcTask;

  constructor(options: CalmsTypescriptPackageOptions) {
    const packageJsonNameParts = options.packageJsonName.split('/');
    const defaultBinScriptName =
      packageJsonNameParts[1] || packageJsonNameParts[0];

    const defaultOptions: CalmsTypescriptPackageOptionsWithDefaults = {
      authorEmail: options.authorEmail,
      authorName: options.authorName,
      binScriptNames:
        options.shouldAddBinScripts === false ? [] : [defaultBinScriptName],
      entrypoint: 'build/src/index.js',
      packageJsonName: options.packageJsonName,
    };
    const mergedOptions: CalmsTypescriptPackageOptions = merge(
      defaultOptions,
      options,
    );

    super(mergedOptions);

    mergedOptions.binScriptNames?.forEach(binScriptName => {
      new SampleFile(this, `bin/${binScriptName}.ts`, {
        contents: `#!/usr/bin/env node

import '../src/cli/${binScriptName}.ts';`,
      });
      new SampleFile(this, `src/cli/${binScriptName}.ts`, {
        contents: `console.log('i am ${binScriptName}');`,
      });
    });

    if (mergedOptions.binScriptNames?.length) {
      const binScripts = mergedOptions.binScriptNames.reduce(
        (acc, binScriptName) => ({
          ...acc,
          [binScriptName]: `build/bin/${binScriptName}.js`,
        }),
        {},
      );
      this.package.addField('bin', binScripts);
      this.tsconfig?.addInclude('bin/**/*.ts');
    }

    const gitPushFollowTags = 'git push --follow-tags --no-verify';

    // Bump version tasks
    this.bumpMajorTask = this.addTask('bump:major', {
      description: 'Bump major version, commit, tag, and push',
      exec: 'pnpm version major -m "chore: release %s"',
    });
    this.bumpMajorTask.exec(gitPushFollowTags);

    this.bumpMinorTask = this.addTask('bump:minor', {
      description: 'Bump minor version, commit, tag, and push',
      exec: 'pnpm version minor -m "chore: release %s"',
    });
    this.bumpMinorTask.exec(gitPushFollowTags);

    this.bumpPatchTask = this.addTask('bump:patch', {
      description: 'Bump patch version, commit, tag, and push',
      exec: 'pnpm version patch -m "chore: release %s"',
    });
    this.bumpPatchTask.exec(gitPushFollowTags);

    this.bumpPreMajorTask = this.addTask('bump:pre-major', {
      description: 'Bump pre-major version (rc), commit, tag, and push',
      exec: 'pnpm version premajor --preid=rc -m "chore: release %s"',
    });
    this.bumpPreMajorTask.exec(gitPushFollowTags);

    this.bumpPreMinorTask = this.addTask('bump:pre-minor', {
      description: 'Bump pre-minor version (rc), commit, tag, and push',
      exec: 'pnpm version preminor --preid=rc -m "chore: release %s"',
    });
    this.bumpPreMinorTask.exec(gitPushFollowTags);

    this.bumpPrePatchTask = this.addTask('bump:pre-patch', {
      description: 'Bump pre-patch version (rc), commit, tag, and push',
      exec: 'pnpm version prepatch --preid=rc -m "chore: release %s"',
    });
    this.bumpPrePatchTask.exec(gitPushFollowTags);

    // Publish tasks
    this.publishOfficialTask = this.addTask('publish:official', {
      description: 'Build and publish official version with latest tag',
    });
    this.publishOfficialTask.spawn(this.buildTask);
    this.publishOfficialTask.exec(
      'pnpm publish --tag latest --access private --no-git-checks',
    );

    this.publishRcTask = this.addTask('publish:rc', {
      description: 'Build and publish RC version with rc tag',
    });
    this.publishRcTask.spawn(this.buildTask);
    this.publishRcTask.exec(
      'pnpm publish --tag rc --access private --no-git-checks',
    );
  }
}
