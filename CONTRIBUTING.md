# Contributing

CodeDuet is still a very early-stage project, thus the codebase is rapidly changing. Although the code was forked from the [DYAD](https://www.dyad.sh/) project, both project have different goals, product road maps and long term trajectories. This code base will remain free + open source and if there is a need to create a more premium product with a PRO plan (or something similar) the spin off product will be seperately maintained. The goal of CodeDuet AI Studio is allow people to learn more about AI development and create awesome + exciting products without vendor lock-in.

Before opening a pull request, please open an issue and discuss whether the change makes sense in CodeDuet. Ensuring a cohesive user experience sometimes means we can't include every possible feature or we need to consider the long-term design of how we want to support a feature area.

For a high-level overview of how CodeDuet works, please see the [Architecture Guide](./docs/architecture.md). Understanding the architecture will help ensure your contributions align with the overall design of the project.

## Development

CodeDuet is an Electron app.

**Install dependencies:**

```sh
npm install
```

**Create the userData directory (required for database)**

```sh
# Unix/macOS/Linux:
mkdir -p userData

# Windows PowerShell (run only if folder doesn't exist):
mkdir userData

# Windows Command Prompt (run only if folder doesn't exist):
md userData
```

**Apply migrations:**

```sh
# Generate and apply database migrations
npm run db:generate
npm run db:push
```

**Run locally:**

```sh
npm start
```

## Setup

If you'd like to contribute a pull request, we highly recommend setting the pre-commit hooks which will run the formatter and linter before each git commit. This is a great way of catching issues early on without waiting to run the GitHub Actions for your pull request.

Simply run this once in your repo:

```sh
npm run init-precommit
```

## Testing

### Unit tests

```sh
npm test
```

### E2E tests

Build the app for E2E testing:

```sh
npm run pre:e2e
```

> Note: you only need to re-build the app when changing the app code. You don't need to re-build the app if you're just updating the tests.

Run the whole e2e test suite:

```sh
npm run e2e
```

Run a specific test file:

```sh
npm run e2e e2e-tests/context_manage.spec.ts
```

Update snapshots for a test:

```sh
npm run e2e e2e-tests/context_manage.spec.ts -- --update-snapshots
```
