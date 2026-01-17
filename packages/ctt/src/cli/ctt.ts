/* eslint-disable no-console */
import { input, select } from '@inquirer/prompts';
import { Command } from 'commander';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { CalmsTypescriptApp } from '../cta';
import { CalmsTypescriptBase } from '../ctb';
import { CalmsTypescriptCdk } from '../ctc';
import { CalmsTypescriptPackage } from '../ctp';
import { TemplateUserFriendly } from '../types';

interface CliOptions {
  authorEmail?: string;
  authorName?: string;
  directory?: string;
  packageJsonName?: string;
  template?: string;
  useLocalCtt?: boolean;
  versionControlRepoName?: string;
}

// Parse command line arguments using commander
const parseArgs = (): CliOptions => {
  const program = new Command();

  program
    .name('ctt')
    .description("CLI tool to scaffold Calm's TypeScript projects")
    .version('0.1.0')
    .argument('[directory]', 'Directory to create the project in', '.')
    .option('-t, --template <name>', 'Template to use (cta, ctc, ctp, ctb)')
    .option('-n, --package-json-name <name>', 'Package name for package.json')
    .option(
      '-v, --version-control-repo-name <name>',
      'Repository name (e.g., my-project)',
    )
    .option('--author-name <name>', 'Author name', 'Alex Wendte')
    .option('--author-email <email>', 'Author email', 'mostcolm@gmail.com')
    .option(
      '--useLocalCtt',
      'Use local @hbict/ctt package (for development/testing)',
    )
    .addHelpText(
      'after',
      `
Templates:
  cta  - Calm's Typescript App
  ctc  - Calm's Typescript CDK
  ctp  - Calm's Typescript Package
  ctb  - Calm's Typescript Base
    `,
    );

  program.parse();

  const options = program.opts<{
    authorEmail?: string;
    authorName?: string;
    packageJsonName?: string;
    template?: string;
    useLocalCtt?: boolean;
    versionControlRepoName?: string;
  }>();
  const { args } = program;

  return {
    authorEmail: options.authorEmail,
    authorName: options.authorName,
    directory: args[0] || '.',
    packageJsonName: options.packageJsonName,
    template: options.template,
    useLocalCtt: options.useLocalCtt,
    versionControlRepoName: options.versionControlRepoName,
  };
};

// Map short template names to full names
const mapTemplateShorthand = (
  template: string,
): null | TemplateUserFriendly => {
  const mapping: Record<string, TemplateUserFriendly> = {
    cta: TemplateUserFriendly.CalmsTypescriptApp,
    ctb: TemplateUserFriendly.CalmsTypescriptBase,
    ctc: TemplateUserFriendly.CalmsTypescriptCdk,
    ctp: TemplateUserFriendly.CalmsTypescriptPackage,
  };

  // Also accept full names
  const fullNames = Object.values(TemplateUserFriendly);
  if (fullNames.includes(template as TemplateUserFriendly)) {
    return template as TemplateUserFriendly;
  }

  return mapping[template.toLowerCase()] ?? null;
};

const promptUser = async (cliOptions: CliOptions) => {
  const template: TemplateUserFriendly = cliOptions.template
    ? (() => {
        const mappedTemplate = mapTemplateShorthand(cliOptions.template);
        if (!mappedTemplate) {
          console.error(`Invalid template: ${cliOptions.template}`);
          console.error('Valid templates: cta, ctc, ctp, ctb');
          process.exit(1);
        }
        return mappedTemplate;
      })()
    : await select({
        choices: [
          TemplateUserFriendly.CalmsTypescriptApp,
          TemplateUserFriendly.CalmsTypescriptCdk,
          TemplateUserFriendly.CalmsTypescriptPackage,
          TemplateUserFriendly.CalmsTypescriptBase,
        ],
        message: 'Which template would you like to use?',
      });

  const directory =
    cliOptions.directory ||
    (await input({
      default: '.',
      message:
        'What directory would you like the service created in? (use . for cwd)',
    }));

  const packageJsonName =
    cliOptions.packageJsonName ||
    (await input({
      default: directory,
      message: 'What would you like the package.json name to be?',
    }));

  const packageNameParts = packageJsonName.split('/');
  const packageActualName = packageNameParts[1] || packageNameParts[0];

  const versionControlRepoName =
    cliOptions.versionControlRepoName ||
    (await input({
      default: packageActualName,
      message:
        'What is the version control repository name? (e.g., my-project)',
    }));

  return {
    directory,
    packageJsonName,
    template,
    versionControlRepoName,
  };
};

const generateProjenrcContent = (
  template: TemplateUserFriendly,
  options: {
    authorEmail: string;
    authorName: string;
    packageJsonName: string;
    useLocalCtt: boolean;
    versionControlRepoName: string;
  },
): string => {
  const templateMap = {
    [TemplateUserFriendly.CalmsTypescriptApp]: 'CalmsTypescriptApp',
    [TemplateUserFriendly.CalmsTypescriptBase]: 'CalmsTypescriptBase',
    [TemplateUserFriendly.CalmsTypescriptCdk]: 'CalmsTypescriptCdk',
    [TemplateUserFriendly.CalmsTypescriptPackage]: 'CalmsTypescriptPackage',
  };

  const className = templateMap[template];

  // Build options in alphabetical order for eslint
  // Build ordered options object with all properties (alphabetically ordered)
  const orderedOptions: Record<string, string | string[]> = {
    authorEmail: options.authorEmail,
    authorName: options.authorName,
    ...(options.useLocalCtt ? { devDeps: ['@hbict/ctt'] } : {}),
    packageJsonName: options.packageJsonName,
    versionControlRepoName: options.versionControlRepoName,
  };

  // Generate the options string
  const optionsString = Object.entries(orderedOptions)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `  ${key}: ['${value.join("', '")}'],`;
      }
      return `  ${key}: '${value}',`;
    })
    .join('\n');

  return `import { ${className} } from '@hbict/ctt';

const project = new ${className}({
${optionsString}
});

project.synth();
`;
};

const go = async () => {
  const cliOptions = parseArgs();
  const answers = await promptUser(cliOptions);

  console.log('\n=== Project Configuration ===');
  console.log(`Template: ${answers.template}`);
  console.log(`Directory: ${answers.directory}`);
  console.log(`Package Name: ${answers.packageJsonName}`);
  console.log(`Repo Name: ${answers.versionControlRepoName}`);
  console.log('============================\n');

  // If using local CTT, link it globally for the binary
  if (cliOptions.useLocalCtt) {
    console.log('🔗 Linking local CTT binary globally...');
    const cttPackagePath = path.join(__dirname, '..', '..', '..');

    try {
      execSync('pnpm link', { cwd: cttPackagePath, stdio: 'inherit' });
      console.log('✓ CTT binary linked globally\n');
    } catch (error) {
      console.error('Failed to link CTT binary globally:', error);
      console.log('You can manually link by running:');
      console.log(`  cd ${cttPackagePath} && pnpm link\n`);
      throw error;
    }
  }

  // Create the project based on the template
  const projectOptions = {
    authorEmail: cliOptions.authorEmail || 'mostcolm@gmail.com',
    authorName: cliOptions.authorName || 'Alex Wendte',
    defaultReleaseBranch: 'main',
    // If using local CTT, skip devDeps to avoid npm install failure (will link after)
    devDeps: cliOptions.useLocalCtt ? [] : ['@hbict/ctt'],
    name: answers.packageJsonName,
    // Don't specify outdir if it's current directory to avoid issues
    ...(answers.directory !== '.' && { outdir: answers.directory }),
    packageJsonName: answers.packageJsonName,
    versionControlRepoName: answers.versionControlRepoName,
  };

  const project = (() => {
    switch (answers.template) {
      case TemplateUserFriendly.CalmsTypescriptApp:
        return new CalmsTypescriptApp(projectOptions);
      case TemplateUserFriendly.CalmsTypescriptBase:
        return new CalmsTypescriptBase(projectOptions);
      case TemplateUserFriendly.CalmsTypescriptCdk:
        return new CalmsTypescriptCdk(projectOptions);
      case TemplateUserFriendly.CalmsTypescriptPackage:
        return new CalmsTypescriptPackage(projectOptions);
      default: {
        console.error(`Unknown template: ${answers.template}`);
        return process.exit(1);
      }
    }
  })();

  // If using local CTT, remove @hbict/ctt from deps before synth
  if (cliOptions.useLocalCtt) {
    project.deps.removeDependency('@hbict/ctt');
  }

  // Synthesize the project
  project.synth();

  // Generate and write the .projenrc.ts file
  const projenrcContent = generateProjenrcContent(answers.template, {
    authorEmail: cliOptions.authorEmail || 'mostcolm@gmail.com',
    authorName: cliOptions.authorName || 'Alex Wendte',
    packageJsonName: answers.packageJsonName,
    useLocalCtt: cliOptions.useLocalCtt || false,
    versionControlRepoName: answers.versionControlRepoName,
  });

  const projenrcPath = path.join(
    answers.directory === '.' ? process.cwd() : answers.directory,
    '.projenrc.ts',
  );
  fs.writeFileSync(projenrcPath, projenrcContent, 'utf-8');

  console.log(`\n✅ Project created successfully in ${answers.directory}`);

  // If using local CTT, add it to devDeps and link it
  if (cliOptions.useLocalCtt) {
    console.log('\n🔗 Linking local CTT package...');
    const cttPackagePath = path.join(__dirname, '..', '..', '..');
    const projectDir =
      answers.directory === '.' ? process.cwd() : answers.directory;

    try {
      // Link @hbict/ctt using directory path (don't add to package.json first)
      execSync(`pnpm link ${cttPackagePath}`, {
        cwd: projectDir,
        stdio: 'inherit',
      });
      console.log('✓ Linked @hbict/ctt from local directory');
      console.log('\nNote: Using local CTT package via pnpm link');
    } catch (error) {
      console.error('Failed to link local CTT:', error);
      console.log('You can manually link by running:');
      console.log(`  cd ${projectDir}`);
      console.log(`  pnpm link ${cttPackagePath}`);
    }
  }

  console.log('\nNext steps:');
  console.log(`  cd ${answers.directory}`);
  console.log('  pnpm run build\n');

  return answers;
};

go().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error('error running ctt', err.message);
  }
});
