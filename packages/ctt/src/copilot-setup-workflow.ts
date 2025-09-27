import { GithubWorkflow } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { TypeScriptProject } from 'projen/lib/typescript';

export class CopilotSetupWorkflow {
  public readonly copilotSetupWorkflow: GithubWorkflow;

  constructor(project: TypeScriptProject) {
    if (!project.github) {
      throw new Error('github must be enabled to use copilot setup workflow');
    }

    this.copilotSetupWorkflow = project.github.addWorkflow(
      'copilot-setup-steps',
    );

    this.copilotSetupWorkflow.on({
      pullRequest: {
        paths: [this.copilotSetupWorkflow.file?.path as string],
      },
      push: {
        paths: [this.copilotSetupWorkflow.file?.path as string],
      },
      workflowDispatch: {},
    });

    this.copilotSetupWorkflow.addJob('copilot-setup-steps', {
      permissions: {
        contents: JobPermission.READ,
      },
      runsOn: ['ubuntu-latest'],
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v5',
        },
        {
          name: 'Set up node.js',
          uses: 'actions/setup-node@v4',
          with: {
            'node-version': '22.x',
          },
        },
        {
          name: 'Install pnpm',
          uses: 'pnpm/action-setup@v4',
          with: {
            version: '10.x.x',
          },
        },
        {
          name: 'Install dependencies',
          run: project.package.installAndUpdateLockfileCommand,
        },
      ],
    });
  }
}
