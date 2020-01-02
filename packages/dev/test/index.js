import fs from 'fs-extra';
import { setLogger } from '../src/logger.js';
import { NullLogger } from './null-logger.js';

const moduleNames = ['./run-command.spec.js', './test-command.spec.js'];

async function run() {
  setLogger(new NullLogger());
  for (const moduleName of moduleNames) {
    const m = await import(moduleName);
    const methods = Object.keys(m).filter(method => /^assert/.test(method));
    for (const method of methods) {
      console.log(method);
      await fs.remove('test/fixtures');
      await m[method]();
    }
  }
  await fs.remove('test/fixtures');
}

/** @type {(err: any) => void} */
const errorHandler = err => {
  console.error(err);
  process.exit(1);
};
process.on('unhandledRejection', errorHandler);
process.on('uncaughtException', errorHandler);

run();
