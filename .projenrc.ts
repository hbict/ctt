import { cdk } from 'projen';
const project = new cdk.JsiiProject({
  author: 'Alex Wendte',
  authorAddress: 'mostcolm@gmail.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.8.0',
  name: 'att',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/mostcolm/att.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();