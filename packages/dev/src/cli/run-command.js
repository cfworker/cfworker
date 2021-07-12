import chalk from 'chalk';
import { Bundler } from '../bundler.js';
import { KV } from '../kv.js';
import { logger } from '../logger.js';
import { StaticSite } from '../static-site.js';
import { WorkerHost } from '../worker-host.js';

/**
 * @typedef {object} RunCommandArgs
 * @property {string} entry
 * @property {number} port
 * @property {boolean} watch
 * @property {boolean} inspect
 * @property {boolean} check
 * @property {string} [site]
 * @property {string[]} kv
 */

/**
 * Bundle and run a worker script
 */
export class RunCommand {
  /**
   * @param {RunCommandArgs} args
   */
  constructor(args) {
    this.args = args;
    this.bundler = new Bundler([args.entry], args.watch, [], args.check);
    this.site = args.site ? new StaticSite(args.site, args.watch) : null;
    this.kv = new KV(args.kv, args.watch);
    this.host = new WorkerHost(args.port, args.inspect, this.site, this.kv);
  }

  async execute() {
    const startTime = Date.now();

    if (!this.args.watch) {
      this.bundler.on('bundle-error', () => process.exit(1));
      if (!this.args.inspect) {
        this.host.on('worker-error', () => process.exit(1));
      }
    }

    this.bundler.bundle();
    const siteInitialized = this.site ? this.site.init() : Promise.resolve();

    await Promise.all([
      this.host.start(),
      this.bundler.bundled,
      siteInitialized,
      this.kv.init()
    ]);

    await this.host.setWorkerCode(
      this.bundler.code,
      '/worker.js',
      [],
      this.site ? this.site.manifest : null,
      this.kv.namespaces
    );

    if (this.args.watch) {
      const update = () =>
        this.host.setWorkerCode(
          this.bundler.code,
          '/worker.js',
          [],
          this.site ? this.site.manifest : null,
          this.kv.namespaces
        );
      this.bundler.on('bundle-end', update);
      if (this.site) {
        this.site.on('change', update);
      }
      this.kv.on('change', update);
    }

    const url = `http://localhost:${this.args.port}/`;
    logger.success(
      `Worker running at ${chalk.cyan.underline(url)}`,
      Date.now() - startTime
    );

    const page = await this.host.pageReady;
    await page.evaluate(url => {
      document.body.innerHTML = `
        <h1>Worker Dev</h1>
        <p>Worker running at <a href="${url}" target="_blank">${url}</a>.</p>`;
    }, url);
  }

  dispose() {
    this.bundler.dispose();
    this.host.dispose();
    if (this.site) {
      this.site.dispose();
    }
    this.kv.dispose();
  }
}
