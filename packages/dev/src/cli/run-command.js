import chalk from 'chalk';
import { Bundler } from '../bundler.js';
import { logger } from '../logger.js';
import { WorkerHost } from '../worker-host.js';

/**
 * @typedef {object} RunCommandArgs
 * @property {string} entry
 * @property {number} port
 * @property {boolean} watch
 * @property {boolean} inspect
 * @property {boolean} check
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
    this.host = new WorkerHost(args.port, args.inspect);
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

    await Promise.all([this.host.start(), this.bundler.bundled]);

    await this.host.setWorkerCode(this.bundler.code);

    if (this.args.watch) {
      this.bundler.on('bundle-end', () =>
        this.host.setWorkerCode(this.bundler.code)
      );
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
  }
}
