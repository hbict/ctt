import { input, select } from '@inquirer/prompts';
import { execSync } from 'child_process';
import fs from 'fs';

import { CalmsTypescriptApp } from '../cta';
import { CalmsTypescriptBase, CalmsTypescriptBaseOptions } from '../ctb';
import { CalmsTypescriptPackage } from '../ctp';
import { TemplateUserFriendly } from '../types';

interface Answers {
  directory: string;
  packageJsonName: string;
  repositoryUrl: string;
  template: TemplateUserFriendly;
}

interface Author {
  email: string;
  name: string;
}

// first argument passed into the script
const argvDirectory = process.argv[2];

const promptUser = async (): Promise<Answers> => {
  const template = await select<TemplateUserFriendly>({
    choices: [
      TemplateUserFriendly.CalmsTypescriptApp,
      TemplateUserFriendly.CalmsTypescriptPackage,
      TemplateUserFriendly.CalmsTypescriptBase,
    ],
    message: 'Which template would you like to use?',
  });

  const directory = await input({
    default: argvDirectory || '.',
    message:
      'What directory would you like the service created in? (use . for cwd)',
  });

  const packageJsonName = await input({
    default: directory,
    message: 'What would you like the package.json name to be?',
  });

  const packageNameParts = packageJsonName.split('/');

  const packageActualName = packageNameParts[1] || packageNameParts[0];

  const defaultRepositoryUrl = `https://github.com/hbict/${packageActualName}.git`;

  const repositoryUrl = await input({
    default: defaultRepositoryUrl,
    message: 'What will the repository url be?',
  });

  return {
    directory,
    packageJsonName,
    repositoryUrl,
    template,
  };
};

const generateProject = (answers: Answers, author: Author) => {
  const options: CalmsTypescriptBaseOptions = {
    authorEmail: author.email,
    authorName: author.name,
    packageJsonName: answers.packageJsonName,
    repository: answers.repositoryUrl,
  };
  if (answers.template === TemplateUserFriendly.CalmsTypescriptApp) {
    return new CalmsTypescriptApp(options);
  }
  if (answers.template === TemplateUserFriendly.CalmsTypescriptBase) {
    return new CalmsTypescriptBase(options);
  }
  return new CalmsTypescriptPackage(options);
};

const go = async () => {
  const answers = await promptUser();

  const name = execSync('git config --get user.name').toString().trim();
  const email = execSync('git config --get user.email').toString().trim();

  const project = generateProject(answers, { email, name });
  const projectClass = project.constructor.name;

  // ! this needs to write to the directory indicated by answers.directory
  fs.writeFileSync(
    '.projenrc.ts',
    `import { ${projectClass} } from './src/ctp';
const project = new ${projectClass}({
  authorEmail: '${email}',
  authorName: '${name}',
  packageJsonName: '${answers.packageJsonName}',
  repository: '${answers.repositoryUrl}',
});
project.synth();
`,
  );
  project.synth();
};

go().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error('error running ctt', err.message);
  }
});
