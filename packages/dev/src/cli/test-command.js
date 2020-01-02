import { Bundler } from '../bundler.js';
import { TestHost } from '../test-host.js';

/**
 * @typedef {object} TestCommandArgs
 * @property {string[]} globs
 * @property {number} port
 * @property {boolean} watch
 * @property {boolean} inspect
 */

export class TestCommand {
  /**
   * @param {TestCommandArgs} args
   */
  constructor(args) {
    this.args = args;
    this.bundler = new Bundler(args.globs, args.watch, ['mocha', 'chai']);
    this.testHost = new TestHost(args.port, args.inspect);
  }

  async execute() {
    if (!this.args.watch) {
      this.bundler.on('bundle-error', () => process.exit(1));
      if (!this.args.inspect) {
        this.testHost.workerHost.on('worker-error', () => process.exit(1));
      }
    }

    await Promise.all([this.bundler.bundle(), this.testHost.start()]);

    const failures = await this.testHost.runTests(this.bundler.code);

    if (this.args.watch) {
      this.bundler.on('bundle-end', () =>
        this.testHost.runTests(this.bundler.code)
      );
    } else {
      this.dispose();
      process.exit(failures ? 1 : 0);
    }
  }

  dispose() {
    this.bundler.dispose();
    this.testHost.dispose();
  }
}
