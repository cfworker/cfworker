import chalk from 'chalk';
import commander from 'commander';
import envinfo from 'envinfo';
import nodeCleanup from 'node-cleanup';
import packageConfig from '../../package.json';
import { loadEnv } from '../env.js';
import { logger } from '../logger.js';
import { BuildCommand } from './build-command.js';
import { DeployCommand, DeployDevCommand } from './deploy-command.js';
import { RunCommand } from './run-command.js';
import { TestCommand } from './test-command.js';

/** @type {{ execute(): void; dispose(): void; }} */
let currentCommand;

nodeCleanup(() => {
  if (currentCommand) {
    currentCommand.dispose();
  }
});

/** @type {(err: any) => void} */
const errorHandler = err => {
  if (currentCommand) {
    try {
      currentCommand.dispose();
    } catch {}
  }
  logger.error(err);
  process.exit(1);
};
process.on('unhandledRejection', errorHandler);
process.on('uncaughtException', errorHandler);

const program = new commander.Command();
program.version(packageConfig.version);

/** @type {import('commander').Command[]} */
const commands = program.commands;

/**
 *
 * @param {string} value
 * @param {string[]} previous
 */
function collect(value, previous) {
  return previous.concat([value]);
}

program
  .command('test [input...]')
  .description('run tests')
  .option('-p, --port <port>', 'set the port to serve on', p => +p, 7000)
  .option('-w, --watch', 'enable watch mode', false)
  .option('-i, --inspect', 'open browser window with devtools enabled', false)
  .option('-n --nocheck', 'disable diagnostic checks on TypeScript code')
  .option('-s --site <directory>', 'static site directory')
  .option('-k --kv <filename>', 'kv json file', collect, [])
  .action((main, command) => {
    loadEnv();
    currentCommand = new TestCommand({
      globs: main,
      port: command.port,
      watch: command.watch,
      inspect: command.inspect,
      check: !command.nocheck,
      site: command.site,
      kv: command.kv
    });
    currentCommand.execute();
  });

program
  .command('run [input...]')
  .description('run worker script')
  .option('-p, --port <port>', 'set the port to serve on', p => +p, 7000)
  .option('-w, --watch', 'enable watch mode', false)
  .option('-i, --inspect', 'open browser window with devtools enabled', false)
  .option('-n --nocheck', 'disable diagnostic checks on TypeScript code')
  .option('-s --site <directory>', 'static site directory')
  .option('-k --kv <filename>', 'kv json file', collect, [])
  .action((main, command) => {
    loadEnv();
    currentCommand = new RunCommand({
      entry: main[0],
      port: command.port,
      watch: command.watch,
      inspect: command.inspect,
      check: !command.nocheck,
      site: command.site,
      kv: command.kv
    });
    currentCommand.execute();
  });

program
  .command('deploy-dev [input...]')
  .description('deploy worker script to workers.dev')
  .option(
    '-p, --project <project>',
    'the name of the workers.dev project',
    'hello-world'
  )
  .option('-w, --watch', 'enable watch mode', false)
  .option('-s --site <directory>', 'static site directory')
  .option('-k --kv <filename>', 'kv json file', collect, [])
  .action((main, command) => {
    loadEnv();
    currentCommand = new DeployDevCommand({
      entry: main[0],
      project: command.project,
      watch: command.watch,
      site: command.site,
      kv: command.kv
    });
    currentCommand.execute();
  });

program
  .command('deploy [input...]')
  .storeOptionsAsProperties(false)
  .description('deploy worker script')
  .option('-n, --name <name>', 'the name of the worker script', 'hello-world')
  .option(
    '-r, --route <pattern>',
    'the route pattern to associate with the worker'
  )
  .option(
    '--purge-cache',
    'purge the cloudflare cache, using the "everything" option',
    false
  )
  .option('-s --site <directory>', 'static site directory')
  .option('-k --kv <filename>', 'kv json file', collect, [])
  .action((main, options) => {
    loadEnv('production');
    currentCommand = new DeployCommand({
      entry: main[0],
      name: options.name,
      route: options.route,
      purgeCache: options.purgeCache,
      site: options.site,
      kv: options.kv
    });
    currentCommand.execute();
  });

program
  .command('build [input...]')
  .description('build worker script')
  .option('-o, --out-file <filename>', 'the output filename', 'dist/worker.js')
  .option('-w, --watch', 'enable watch mode', false)
  .action((main, command) => {
    loadEnv();
    currentCommand = new BuildCommand({
      entry: main[0],
      outFile: command.outFile,
      watch: command.watch
    });
    currentCommand.execute();
  });

program
  .command('info')
  .description('Prints debugging information about the local environment')
  .action(function () {
    console.log(chalk.bold('\nEnvironment Info:'));
    envinfo
      .run({
        System: ['OS', 'CPU'],
        Binaries: ['Node', 'Yarn', 'npm'],
        Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
        npmPackages: ['@cfworker/dev'],
        npmGlobalPackages: ['@cfworker/dev']
      })
      .then(console.log);
  });

program
  .command('help [command]')
  .description('display help information for a command')
  .action(command => {
    const cmd =
      commands.find(
        c => typeof c.name === 'function' && c.name() === command
      ) || program;
    cmd.help();
  });

program.on('--help', function () {
  console.log('');
  console.log(
    '  Run `' +
      chalk.bold('cfworker help <command>') +
      '` for more information on specific commands'
  );
  console.log('');
});

// // Make test the default command except for --help
// var args = process.argv;
// if (args[2] === '--help' || args[2] === '-h') args[2] = 'help';
// if (!args[2] || !commands.some(c => c.name() === args[2])) {
//   args.splice(2, 0, 'test');
// }

program.parse(process.argv);
