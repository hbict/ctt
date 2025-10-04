# Copilot Instructions for CTT (Calm's TypeScript Templates)

## Repository Summary

**CTT (Calm's TypeScript Templates)** is a projen-based TypeScript project that provides templates and scaffolding tools for creating TypeScript applications and packages. It generates consistent project structures with preconfigured tools for linting, testing, building, and continuous integration.

## High Level Repository Information

- **Size**: ~42 TypeScript source files
- **Type**: TypeScript library/CLI tool with projen-based project generation
- **Languages**: TypeScript (primary), JavaScript (configuration)
- **Frameworks**: Projen (project generation), Inquirer (CLI prompts)
- **Target Runtime**: Node.js 22.0.0+
- **Package Manager**: pnpm v10.x.x
- **Test Framework**: Vitest with coverage
- **Linting**: ESLint + Prettier with strict TypeScript rules
- **Build Tool**: TypeScript compiler + projen orchestration

## Build and Validation Commands

### Prerequisites

- **Node.js**: Version 22.0.0 or higher (check: `node --version`)
- **pnpm**: Version 10.x.x (check: `pnpm --version`)

### Bootstrap/Setup

```bash
# Install dependencies (always run this first)
pnpm install
# Note: This will trigger husky setup automatically via the 'prepare' script
```

**Alternative Setup**: The repository includes a `copilot-setup-steps.yml` GitHub Actions workflow that automatically handles the complete setup including Node.js version, pnpm installation, and dependency installation from the lock file.

### Build Process

```bash
# Full build (recommended for development)
pnpm run build
# OR using projen directly
npx projen build

# Compile only (faster, no tests/linting)
pnpm run compile
# OR
npx projen compile
```

**Build Process Details**:

1. Runs `tsx .projenrc.ts` (default task - regenerates projen files)
2. Compiles TypeScript (`tsc --build`)
3. Runs linting (prettier + eslint)
4. Runs tests with coverage

### Testing

```bash
# Run tests (basic, no coverage)
pnpm test

# Run tests with coverage (used in CI)
pnpm run test:coverage
# OR
npx projen test:coverage

# Watch mode for development
pnpm run test:watch
# OR
npx projen test:watch

# Update snapshots
pnpm run test:update-snapshots
# OR
npx projen test:update-snapshots
```

### Linting and Formatting

```bash
# Run linting and formatting (auto-fixes)
pnpm run lint
# OR
npx projen lint
```

**Linting Process**:

1. Prettier formats all `.ts` and `.tsx` files
2. ESLint checks and auto-fixes TypeScript files
3. Uses strict TypeScript rules with import sorting

### Running the CLI

```bash
# After building, run the CLI tool
node build/bin/ctt.js [directory]
# OR using pnpm
pnpm exec @calm/ctt [directory]
```

### Important Timing Notes

- **Build**: ~30-60 seconds (includes tests and linting)
- **Compile only**: ~5-10 seconds
- **Tests**: ~5-15 seconds
- **Lint**: ~10-20 seconds

### Common Issues and Workarounds

1. **Always run `pnpm install` before building** - The project uses pnpm workspaces and specific versions
2. **Snapshot test failures**: Run `pnpm run test:update-snapshots` to fix mismatched snapshots
3. **Projen sync issues**: If you see "self mutation" errors, run `npx projen` to regenerate files
4. **Git hooks failing**: Ensure all changes are committed before pushing (pre-push hook runs `yarn projen`)

## Project Layout and Architecture

### Root Structure

```
├── .github/workflows/          # CI/CD pipelines
├── .husky/                     # Git hooks (pre-commit, pre-push)
├── __tests__/                  # Test files (vitest)
├── bin/                        # CLI entry points
├── build/                      # Compiled output (gitignored)
├── src/                        # Source code
│   ├── cli/                    # CLI implementation
│   ├── eslint/                 # ESLint configuration
│   ├── types/                  # TypeScript type definitions
│   ├── ctb.ts                  # CalmsTypescriptBase (core class)
│   ├── ctp.ts                  # CalmsTypescriptPackage
│   ├── cta.ts                  # CalmsTypescriptApp
│   └── *.ts                    # Supporting components
├── .projenrc.ts                # Projen configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vitest.config.mts          # Test configuration
└── eslint.config.mjs          # ESLint configuration
```

### Key Architecture Components

**Core Classes**:

- `CalmsTypescriptBase` (`src/ctb.ts`): Base template with common TypeScript project setup
- `CalmsTypescriptPackage` (`src/ctp.ts`): Extended template for npm packages with bin scripts
- `CalmsTypescriptApp` (`src/cta.ts`): Extended template for applications

**Supporting Components**:

- `Husky` (`src/husky.ts`): Git hooks configuration
- `Vitest` (`src/vitest.ts`): Test framework setup
- `CalmsEslint` (`src/calms-eslint.ts`): Linting configuration
- `CopilotSetupWorkflow` (`src/copilot-setup-workflow.ts`): GitHub Actions for Copilot
- `UpdateSnapshotsWorkflow` (`src/update-snapshots-workflow.ts`): Snapshot update automation

### Configuration Files

- **`.projenrc.ts`**: Main project configuration using projen
- **`tsconfig.json`**: TypeScript compiler options (Node16 modules, strict mode)
- **`vitest.config.mts`**: Test configuration (excludes dist/lib/node_modules)
- **`eslint.config.mjs`**: ESLint flat config with TypeScript strict rules
- **`.prettierrc.json`**: Prettier formatting rules
- **`.husky/`**: Git hooks for pre-commit (lint-staged, test:coverage, compile) and pre-push (projen sync check)

### CI/CD Workflows

**GitHub Actions** (`.github/workflows/`):

- `build.yml`: Main CI pipeline (build, test, lint) with self-mutation detection
- `copilot-setup-steps.yml`: Automated setup workflow (Node.js, pnpm, dependencies)
- `pull-request-lint.yml`: PR title and content validation
- `release.yml`: Automated releases
- `update-snapshots.yml`: Automated snapshot updates
- `upgrade-main.yml`: Dependency upgrades

**Validation Pipeline Order**:

1. Install dependencies (`pnpm i --frozen-lockfile`)
2. Build project (`npx projen build`)
3. Check for self-mutations (projen file changes)
4. Upload/apply patches if mutations detected

### Development Validation Steps

1. **Pre-commit Hook**: Runs lint-staged, test:coverage, and compile
2. **Pre-push Hook**: Verifies no uncommitted projen changes
3. **CI Validation**: Full build with mutation detection
4. **Manual Verification**: Run `npx projen` and ensure no file changes

### Dependencies Overview

**Key Runtime Dependencies**:

- `@inquirer/prompts`: CLI user interaction
- `projen`: Project generation framework

**Key Development Dependencies**:

- `typescript`: TypeScript compiler
- `tsx`: TypeScript execution (faster than ts-node)
- `vitest`: Testing framework with coverage
- `eslint`: Linting with strict TypeScript rules
- `prettier`: Code formatting
- `husky`: Git hooks management

### Key Files in Repository Root

- `LICENSE`: Apache-2.0 license
- `README.md`: Basic project documentation
- `TODO.md`: Development roadmap
- `package.json`: NPM package configuration with bin script
- `pnpm-lock.yaml`: Dependency lock file
- `.gitignore`: Excludes build/, node_modules/, coverage/
- `.npmrc`: pnpm configuration with resolution-mode=highest

## Commit Message Requirements

**IMPORTANT**: All commits and pull request titles must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification as enforced by commitlint.

### Required Format

```
<type>: <description>

[optional body]
```

### Allowed Types

- `chore`: Maintenance tasks, dependency updates, build changes
- `docs`: Documentation changes
- `feat`: New features
- `fix`: Bug fixes
- `refactor`: Code restructuring without functional changes
- `test`: Adding or modifying tests

### Rules

- **Type is required**: Must be one of the allowed types above
- **Description is required**: Brief summary in present tense
- **Blank line required**: Must have blank line between title and body (if body exists)
- **No scope required**: Scopes are optional in this project

### Examples

```
feat: add new CLI template option
fix: resolve build failure on Windows
docs: update installation instructions
chore: bump dependencies to latest versions
```

**Validation**: Commit messages are validated by a pre-commit hook using commitlint, and PR titles are validated by GitHub Actions.

## Trust These Instructions

These instructions have been thoroughly validated by running all commands and exploring the complete codebase. Only perform additional searches if:

1. The information provided here is incomplete for your specific task
2. You encounter errors that aren't covered in the "Common Issues" section
3. The repository structure has changed significantly from what's documented

All build, test, and lint commands have been verified to work correctly in the current repository state.

## TypeScript Coding Standards

### Optional Chaining

Use the optional chaining operator (`?.`) wherever possible to avoid unnecessary if statements.

**✅ Good:**

```typescript
this.tsconfig?.addInclude('cdk/**/*.ts');
project.testTask?.spawn(newTask);
```

**❌ Avoid:**

```typescript
if (this.tsconfig) {
  this.tsconfig.addInclude('cdk/**/*.ts');
}
```

### Task Access

Prefer using instance task properties over `tryFind` when accessing common tasks.

**✅ Good:**

```typescript
this.preCompileTask.reset('rimraf build');
this.postCompileTask.reset('cdk synth --silent');
this.compileTask.reset('tsc --noEmit');
```

**❌ Avoid:**

```typescript
const preCompileTask = this.tasks.tryFind('pre-compile');
if (preCompileTask) {
  preCompileTask.reset('rimraf build');
}
```

### Common Task Properties Available

- `this.preCompileTask`
- `this.postCompileTask`
- `this.compileTask`
- `this.testTask`
- `this.defaultTask`

### Task Creation

When creating tasks with `addTask()`, always include the first `exec` command inline in the task options (unless the first step is a `spawn`).

**✅ Good:**

```typescript
this.deployTask = this.addTask('deploy', {
  description: 'Deploy the application',
  exec: 'cdk deploy --all',
});
this.deployTask.exec('echo "Deployment complete"');
```

**❌ Avoid:**

```typescript
this.deployTask = this.addTask('deploy', {
  description: 'Deploy the application',
});
this.deployTask.exec('cdk deploy --all');
this.deployTask.exec('echo "Deployment complete"');
```

**Exception for spawn:** When the first step is a `spawn`, do not include `exec` in the options:

```typescript
this.publishTask = this.addTask('publish', {
  description: 'Build and publish',
});
this.publishTask.spawn(this.buildTask);
this.publishTask.exec('pnpm publish');
```

### Component Instance Storage

When creating components that define tasks, always save the tasks to instance properties for later access. Also save component instances to the base class for reuse.

**✅ Good:**

```typescript
export class MyComponent extends Component {
  public readonly myCustomTask: Task;

  constructor(project: TypeScriptProject) {
    super(project);
    this.myCustomTask = project.addTask('my-task', { ... });
  }
}

// In base class:
export class CalmsTypescriptBase extends typescript.TypeScriptProject {
  public readonly myComponent: MyComponent;

  constructor(options: CalmsTypescriptBaseOptions) {
    super(mergedOptions);
    this.myComponent = new MyComponent(this);
  }
}
```

### Array Ordering

Where it doesn't affect functionality, always order arrays in alphabetical order for consistency and easier maintenance.

**✅ Good:**

```typescript
const files = [
  'eslint.config.mjs',
  'package.json',
  'tsconfig.json',
  'vitest.config.mts',
];
```

## Testing Standards

### Use Snapshot Tests for Generated Files

For projen-based projects, snapshot tests automatically validate dependencies and tasks through generated files like `.projen/deps.json` and `.projen/tasks.json`. Avoid redundant explicit testing of these when snapshots cover them.

**❌ Avoid:**

```typescript
// Redundant when snapshots cover deps.json and tasks.json
expect(project.deps.all).toContain('aws-cdk-lib');
expect(taskNames).toContain('deploy');
```

**✅ Good:**

```typescript
// Snapshot tests cover all generated files including deps and tasks
expect(snapshot[fileName]).toMatchSnapshot();
```
