import {
  ArrowParens,
  EndOfLine,
  type PrettierSettings,
  TrailingComma,
} from 'projen/lib/javascript';

export const prettierSettings: PrettierSettings = {
  arrowParens: ArrowParens.AVOID,
  endOfLine: EndOfLine.LF,
  printWidth: 100,
  singleQuote: true,
  trailingComma: TrailingComma.ALL,
};
