/* eslint-disable no-console */
import { input, select } from '@inquirer/prompts';

import { TemplateUserFriendly } from '../types';

// first argument passed into the script
const argvDirectory = process.argv[2];

const promptUser = async () => {
  const template = await select({
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

const go = async () => {
  const answers = await promptUser();

  return answers;
};

go().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error('error running ctt', err.message);
  }
});
