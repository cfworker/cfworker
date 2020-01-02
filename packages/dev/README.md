# @cfworker/dev

Opinionated CLI for Cloudflare Worker development and deployment.
Uses Rollup for clean packaging of code and dependencies and .env files for secret management.
Supports JavaScript or TypeScript with `process.env.*` environment variable substitution with zero configuration.
Simulates the Cloudflare Worker runtime using puppeteer, restricting access to the subset of APIs supported in workers.

Create a `.env` file (and optionally a `.env.production` file) at the root of your project with the following values:

```
CLOUDFLARE_EMAIL=xxxxxxxxxxxxxxx
CLOUDFLARE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_ZONE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_WORKERS_DEV_PROJECT=xxxxxx
```

Usage:

```
cfworker [options] [command]

Options:
  -V, --version                    output the version number
  -h, --help                       output usage information

Commands:
  test [options] [input...]        run tests
  run [options] [input...]         run worker script
  deploy-dev [options] [input...]  deploy worker script to workers.dev
  deploy [options] [input...]      deploy worker script
  build [options] [input...]       build worker script
  info                             Prints debugging information about the local environment
  help [command]                   display help information for a command

  Run `cfworker help <command>` for more information on specific commands
```

## run

Bundle and run a worker script.

Usage:

```
cfworker run [options] [input...]
```

Options:

```
  -p, --port <port>  set the port to serve on (default: 7000)
  -w, --watch        enable watch mode (default: false)
  -i, --inspect      open browser window with devtools enabled (default: false)
  -h, --help         output usage information
```

Examples:

```
cfworker run worker.js

cfworker run --watch src/index.ts

cfworker run --watch --inspect src/worker.js
```

## test

Write tests using mocha and chai, then use the `cfworker test` command to run the tests in a simulated Cloudflare Worker runtime.

Usage:

```
cfworker test [options] [globs...]
```

Options:

```
  -p, --port <port>  set the port to serve on (default: 7000)
  -w, --watch        enable watch mode (default: false)
  -i, --inspect      open browser window with devtools enabled (default: false)
  -h, --help         output usage information
```

Examples:

```
cfworker test ./test/**/*.spec.ts

cfworker test ./test/**/*.spec.js

cfworker test --watch --inspect ./test/**/*.spec.ts
```

Here's an example test file: [packages/base64url/test/index.spec.ts](/packages/base64url/test/index.spec.ts)
