# @cfworker/dev

Run, test and deploy Cloudflare workers.
Opinionated CLI for Cloudflare Worker development and deployment.
Uses Rollup for clean packaging of code and dependencies and .env files for secret management.
Supports JavaScript or TypeScript with `process.env.*` environment variable substitution, no configuration required.
Simulates the Cloudflare Worker runtime using puppeteer, restricting access to the subset of APIs supported in workers.
Supports local development of Workers Sites, as well as deployment.

To deploy you'll need to create a `.env` file (and optionally a `.env.production` file) at the root of your project with the following values:

```
CLOUDFLARE_EMAIL=xxxxxxxxxxxxxxx
CLOUDFLARE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_ZONE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_WORKERS_DEV_PROJECT=xxxxxx
```

Please note that `cfworker` supports two authentication options:

  1. using API tokens, where you can provide fine-graned permission scopes (e.g. to deploy this package you may want to create a token using the "Edit Cloudflare Workers" template in CloudFlare's console;
  2. using your API key, where you basically grant `cfworker` to do API calls on your behalf (e.g. the code will have full and unrestricted access to everything in your CloudFlare account).

If you prefer option 1, then put your API token into CLOUDFLARE_API_KEY and ensure that CLOUDFLARE_EMAIL is not defined in your `.env` file.  Otherwise, to use option 2, put your API key into CLOUDFLARE_API_KEY and configure CLOUDFLARE_EMAIL to your e-mail used to access your account.

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
  -p, --port <port>       set the port to serve on (default: 7000)
  -w, --watch             enable watch mode (default: false)
  -i, --inspect           open browser window with devtools enabled (default: false)
  -n, --nocheck           disable diagnostic checks on TypeScript code (default: false)
  -s, --site <directory>  static site directory
  -h, --help              output usage information
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
  -p, --port <port>       set the port to serve on (default: 7000)
  -w, --watch             enable watch mode (default: false)
  -i, --inspect           open browser window with devtools enabled (default: false)
  -n, --nocheck           disable diagnostic checks on TypeScript code (default: false)
  -s, --site <directory>  static site directory
  -h, --help              output usage information
```

Examples:

```
cfworker test ./test/**/*.spec.ts

cfworker test ./test/**/*.spec.js

cfworker test --watch --inspect ./test/**/*.spec.ts
```

Here's an example test file: [packages/base64url/test/index.spec.ts](/packages/base64url/test/index.spec.ts)

## build

Build/bundle a worker script and output the result to a file.

Usage:

```
cfworker build [options] [input...]
```

Options:

```
  -o, --out-file <filename>  the output filename (default: "dist/worker.js")
  -w, --watch                enable watch mode (default: false)
  -h, --help                 output usage information
```

Examples:

```
cfworker build src/index.ts --out-file dist/index.js
```
