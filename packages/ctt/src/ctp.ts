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

import '../lib/src/cli/${binScriptName}.ts';`,
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
  }
}
