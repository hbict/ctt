import { Task } from 'projen';
import { GithubWorkflow } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { TypeScriptProject } from 'projen/lib/typescript';

export class UpdateSnapshotsWorkflow {
  public readonly updateSnapshotsWorkflow: GithubWorkflow;

  constructor(
    project: { vitest: { updateSnapshotsTask: Task } } & TypeScriptProject,
  ) {
    if (!project.github) {
      throw new Error(
        'github must be enabled to use update snapshots workflow',
      );
    }

    this.updateSnapshotsWorkflow =
      project.github.addWorkflow('update-snapshots');

    this.updateSnapshotsWorkflow.on({ workflowDispatch: {} });

    this.updateSnapshotsWorkflow.addJob('update-snapshots', {
      permissions: {
        contents: JobPermission.WRITE,
      },
      runsOn: ['ubuntu-latest'],
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v5',
          with: {
            // eslint-disable-next-line no-template-curly-in-string
            ref: '${{ github.ref_name }}',
            // eslint-disable-next-line no-template-curly-in-string
            token: '${{ secrets.PROJEN_GITHUB_TOKEN }}',
          }
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
          run: project.package.installCommand,
        },
        {
          name: 'Update snapshots',
          run: project.runTaskCommand(project.vitest.updateSnapshotsTask),
        },
        {
          id: 'check_for_changes',
          name: 'Check for changes',
          run: [
            'git add .',
            'git diff --staged --patch --exit-code > repo.patch || echo "has_changes=true" >> $GITHUB_OUTPUT',
          ].join('\n'),
          shell: 'bash',
        },
        {
          if: "steps.check_for_changes.outputs.has_changes == 'true'",
          name: 'Set git identity',
          run: [
             'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
             'git config user.name "github-actions[bot]"',
          ].join('\n'),
        },
        {
          if: "steps.check_for_changes.outputs.has_changes == 'true'",
          name: 'Commit and push changes',
          run: [
            // the build verifies the commit, so no-verify can be used
            'git commit -s -m "chore: updates snapshots" --no-verify',
            // the build verifies mutation, so no-verify can be used
            // eslint-disable-next-line no-template-curly-in-string
            'git push origin "HEAD:${{ github.ref_name }}" --no-verify',
          ].join('\n'),
        },
      ],
    });
  }
}
