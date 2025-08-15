import deepmerge from 'deepmerge';

import {
  CalmsProjectType,
  CalmsTypescriptBase,
  CalmsTypescriptBaseOptions,
} from './ctb';

export type AddRequiredDefaultCalmsTypescriptAppOptions<TOptionalOptions> = {
  calmsProjectType: CalmsProjectType;
} & TOptionalOptions;

export type CalmsTypescriptAppOptions = Omit<
  CalmsTypescriptBaseOptions,
  'calmsProjectType'
>;

export class CalmsTypescriptApp extends CalmsTypescriptBase {
  constructor(options: CalmsTypescriptAppOptions) {
    const defaultOptions: AddRequiredDefaultCalmsTypescriptAppOptions<
      Partial<CalmsTypescriptAppOptions>
    > = {
      calmsProjectType: CalmsProjectType.App,
    };
    const mergedOptions = deepmerge<
      AddRequiredDefaultCalmsTypescriptAppOptions<CalmsTypescriptAppOptions>
    >(defaultOptions, options);

    super(mergedOptions);
  }
}
