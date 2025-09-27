import { ExampleCta } from './projenrc/example-cta';
import { ExampleCtc } from './projenrc/example-ctc';
import { ExampleCtp } from './projenrc/example-ctp';
import { Monorepo } from './projenrc/monorepo';
import { PackageCtt } from './projenrc/package-ctt';

const monorepo = new Monorepo();

new PackageCtt(monorepo);

new ExampleCta(monorepo);

new ExampleCtc(monorepo);

new ExampleCtp(monorepo);

monorepo.synth();
