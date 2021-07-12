import { Bundler } from '../bundler.js';
import { KV } from '../kv.js';
import { StaticSite } from '../static-site.js';
import { TestHost } from '../test-host.js';

/**
 * @typedef {object} TestCommandArgs
 * @property {string[]} globs
 * @property {number} port
 * @property {boolean} watch
 * @property {boolean} inspect
 * @property {boolean} check
 * @property {string} [site]
 * @property {string[]} kv
 */

export class TestCommand {
  /**
   * @param {TestCommandArgs} args
   */
  constructor(args) {
    this.args = args;
    const treeshake = false;
    this.bundler = new Bundler(
      args.globs,
      args.watch,
      ['mocha', 'chai'],
      args.check,
      treeshake
    );
    this.site = args.site ? new StaticSite(args.site, args.watch) : null;
    this.kv = new KV(args.kv, args.watch);
    this.testHost = new TestHost(args.port, args.inspect, this.site, this.kv);
  }

  async execute() {
    if (!this.args.watch) {
      this.bundler.on('bundle-error', () => process.exit(1));
      if (!this.args.inspect) {
        this.testHost.workerHost.on('worker-error', () => process.exit(1));
      }
    }

    const siteInitialized = this.site ? this.site.init() : Promise.resolve();

    await Promise.all([
      this.bundler.bundle(),
      this.testHost.start(),
      siteInitialized,
      this.kv.init()
    ]);

    const failures = await this.testHost.runTests(
      this.bundler.code,
      this.site ? this.site.manifest : null
    );

    if (this.args.watch) {
      const update = () =>
        this.testHost.runTests(
          this.bundler.code,
          this.site ? this.site.manifest : null
        );
      this.bundler.on('bundle-end', update);
      if (this.site) {
        this.site.on('change', update);
      }
    } else {
      this.dispose();
      process.exit(failures ? 1 : 0);
    }
  }

  dispose() {
    this.bundler.dispose();
    this.testHost.dispose();
    if (this.site) {
      this.site.dispose();
    }
    this.kv.dispose();
  }
}
