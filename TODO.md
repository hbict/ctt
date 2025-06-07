# To Do

1. bin
   1. need to decide whether to do cta, ctb, and ctp as separate clis or all as one
      1. Then just inquirer with the initial options picking which one
2. automate completion of dependency PRs into main
   1. allowedUsernames -> defauls to any
   2. labels -> defauls to any
   3. mergeMethod -> defauls to squash
   4. targetBranchs -> not sure the default
      1. Set up a policy on the target branch that must pass for merge approval

## Clickup Github Workflow Config

```ts
export default {
  autoApproveOptions: {
    allowedUsernames: [renovateWorkflow.RENOVATE_GITHUB_USERNAME],
    label: renovateWorkflow.AUTO_APPROVE_PR_LABEL,
  },
  autoApproveUpgrades: true,
  depsUpgrade: true,
  depsUpgradeOptions: {
    workflow: false,
  },
  renovatebot: true,
};
```
