import chalk from 'chalk';
import { Bundler } from '../bundler.js';
import {
  deploy,
  deployToWorkersDev,
  getWorkersDevSubdomain
} from '../cloudflare-api.js';
import { logger } from '../logger.js';

export class DeployDevCommand {
  /**
   * @param {{ project: string; entry: string; watch: boolean; }} args
   */
  constructor(args) {
    const {
      CLOUDFLARE_EMAIL,
      CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_API_KEY,
      CLOUDFLARE_WORKERS_DEV_PROJECT = args.project
    } = process.env;

    if (!CLOUDFLARE_EMAIL) {
      throw new Error('CLOUDFLARE_EMAIL environment variable is not defined.');
    }
    if (!CLOUDFLARE_ACCOUNT_ID) {
      throw new Error(
        'CLOUDFLARE_ACCOUNT_ID environment variable is not defined.'
      );
    }
    if (!CLOUDFLARE_API_KEY) {
      throw new Error(
        'CLOUDFLARE_API_KEY environment variable is not defined.'
      );
    }

    this.accountEmail = CLOUDFLARE_EMAIL;
    this.accountId = CLOUDFLARE_ACCOUNT_ID;
    this.apiKey = CLOUDFLARE_API_KEY;
    this.project = CLOUDFLARE_WORKERS_DEV_PROJECT;
    this.watch = args.watch;
    this.bundler = new Bundler([args.entry], args.watch);
  }

  async execute() {
    await this.bundler.bundle();

    logger.progress('Getting subdomain...');
    const subdomain = await getWorkersDevSubdomain(
      this.accountId,
      this.accountEmail,
      this.apiKey
    );
    const url = `https://${this.project}.${subdomain}.workers.dev`;

    if (this.watch) {
      this.bundler.on('bundle-end', () => this.deploy(url));
    }

    await this.deploy(url);
  }

  /**
   * @param {string} url
   */
  async deploy(url) {
    const startTime = Date.now();
    logger.progress(`Deploying worker...`);

    await deployToWorkersDev({
      code: this.bundler.code,
      accountEmail: this.accountEmail,
      accountId: this.accountId,
      apiKey: this.apiKey,
      project: this.project
    });

    logger.success(
      `Deployed worker to ${chalk.cyan.underline(url)}`,
      Date.now() - startTime
    );
  }

  dispose() {
    this.bundler.dispose();
  }
}

export class DeployCommand {
  /**
   * @param {{ entry: string; name: string; route: string; purgeCache: boolean; }} args
   */
  constructor(args) {
    const {
      CLOUDFLARE_EMAIL,
      CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_API_KEY,
      CLOUDFLARE_ZONE_ID
    } = process.env;

    if (!CLOUDFLARE_EMAIL) {
      throw new Error('CLOUDFLARE_EMAIL environment variable is not defined.');
    }
    if (!CLOUDFLARE_ACCOUNT_ID) {
      throw new Error(
        'CLOUDFLARE_ACCOUNT_ID environment variable is not defined.'
      );
    }
    if (!CLOUDFLARE_API_KEY) {
      throw new Error(
        'CLOUDFLARE_API_KEY environment variable is not defined.'
      );
    }
    if (!CLOUDFLARE_ZONE_ID) {
      throw new Error(
        'CLOUDFLARE_ZONE_ID environment variable is not defined.'
      );
    }

    this.accountEmail = CLOUDFLARE_EMAIL;
    this.accountId = CLOUDFLARE_ACCOUNT_ID;
    this.apiKey = CLOUDFLARE_API_KEY;
    this.zoneId = CLOUDFLARE_ZONE_ID;
    this.args = args;
    this.bundler = new Bundler([args.entry], false);
  }

  async execute() {
    const startTime = Date.now();

    await this.bundler.bundle();

    logger.progress('Deploying worker...');

    const zoneName = await deploy({
      name: this.args.name,
      code: this.bundler.code,
      accountId: this.accountId,
      accountEmail: this.accountEmail,
      zoneId: this.zoneId,
      apiKey: this.apiKey,
      purgeCache: this.args.purgeCache,
      routePattern: this.args.route
    });

    const url = 'https://' + (this.args.route ? this.args.route : zoneName);
    logger.success(
      `Deployed worker to ${chalk.cyan.underline(url)}`,
      Date.now() - startTime
    );
  }

  dispose() {}
}
