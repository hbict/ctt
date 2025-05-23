import { cdk } from "projen";
const project = new cdk.JsiiProject({
  author: "Alex Wendte",
  authorAddress: "mostcolm@gmail.com",
  defaultReleaseBranch: "main",
  jsiiVersion: "~5.8.0",
  name: "@calm/tt",
  projenrcTs: true,
  repositoryUrl: "https://github.com/alexwendte/tt.git",
});
project.synth();
