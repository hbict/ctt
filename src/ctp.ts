import deepmerge from 'deepmerge';
import { SampleFile } from 'projen';

import {
  CalmsProjectType,
  CalmsTypescriptBase,
  CalmsTypescriptBaseOptions,
} from './ctb';

export type AddRequiredDefaultCalmsTypescriptPackageOptions<TOptionalOptions> =
  {
    calmsProjectType: CalmsProjectType;
  } & TOptionalOptions;

export interface CalmsTypescriptPackageOptions
  extends Omit<CalmsTypescriptBaseOptions, 'calmsProjectType'> {
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

export class CalmsTypescriptPackage extends CalmsTypescriptBase {
  constructor(options: CalmsTypescriptPackageOptions) {
    const packageJsonNameParts = options.packageJsonName.split('/');
    const defaultBinScriptName =
      packageJsonNameParts[1] || packageJsonNameParts[0];

    const defaultOptions: AddRequiredDefaultCalmsTypescriptPackageOptions<
      Partial<CalmsTypescriptPackageOptions>
    > = {
      binScriptNames:
        options.shouldAddBinScripts === false ? [] : [defaultBinScriptName],
      calmsProjectType: CalmsProjectType.Package,
    };
    const mergedOptions = deepmerge<
      AddRequiredDefaultCalmsTypescriptPackageOptions<CalmsTypescriptPackageOptions>
    >(defaultOptions, options);

    super(mergedOptions);

    this.addFields({
      files: [`${this.tsconfig?.compilerOptions?.outDir}/src`],
      main: `${this.tsconfig?.compilerOptions?.outDir}/src/index.js`,
      types: `${this.tsconfig?.compilerOptions?.outDir}/src/index.d.ts`,
    });

    mergedOptions.binScriptNames?.forEach(binScriptName => {
      new SampleFile(this, `bin/${binScriptName}.js`, {
        contents: `#!/usr/bin/env node
require('../lib/src/cli/${binScriptName}.js');`,
      });
      new SampleFile(this, `src/cli/${binScriptName}.ts`, {
        contents: `console.log('i am ${binScriptName}');`,
      });
    });

    if (mergedOptions.binScriptNames?.length) {
      const binScripts = mergedOptions.binScriptNames.reduce(
        (acc, binScriptName) => ({
          ...acc,
          [binScriptName]: `bin/${binScriptName}.js`,
        }),
        {},
      );
      this.package.addField('bin', binScripts);
    }
  }
}
