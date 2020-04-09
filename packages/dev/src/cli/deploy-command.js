import chalk from 'chalk';
import { Bundler } from '../bundler.js';
import {
  deploy,
  deployToWorkersDev,
  getWorkersDevSubdomain
} from '../cloudflare-api.js';
import { KV } from '../kv.js';
import { logger } from '../logger.js';
import { StaticSite } from '../static-site.js';

export class DeployDevCommand {
  /**
   * @param {{ project: string; entry: string; watch: boolean; site?: string; kv: string[]; }} args
   */
  constructor(args) {
    const {
      CLOUDFLARE_EMAIL,
      CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_API_KEY,
      CLOUDFLARE_WORKERS_DEV_PROJECT = args.project
    } = process.env;

    if (!CLOUDFLARE_API_KEY) {
      throw new Error(
        'CLOUDFLARE_API_KEY environment variable is not defined.'
      );
/** XXX - if email is not specified then CLOUDFLARE_API_KEY must be an API token
    if (!CLOUDFLARE_EMAIL) {
      throw new Error('CLOUDFLARE_EMAIL environment variable is not defined.');
    }
*/
    if (!CLOUDFLARE_ACCOUNT_ID) {
      throw new Error(
        'CLOUDFLARE_ACCOUNT_ID environment variable is not defined.'
      );
    }
    }

    this.accountEmail = CLOUDFLARE_EMAIL;
    this.accountId = CLOUDFLARE_ACCOUNT_ID;
    this.apiKey = CLOUDFLARE_API_KEY;
    this.project = CLOUDFLARE_WORKERS_DEV_PROJECT;
    this.watch = args.watch;
    this.bundler = new Bundler([args.entry], args.watch);
    this.site = args.site ? new StaticSite(args.site, false) : null;
    this.kv = new KV(args.kv, false);
  }

  async execute() {
    await Promise.all([
      this.bundler.bundle(),
      this.site ? this.site.init() : Promise.resolve(),
      this.kv.init()
    ]);

    logger.progress('Getting subdomain...');
    const subdomain = await getWorkersDevSubdomain(
      this.accountId,
      this.accountEmail,
      this.apiKey
    );
    const url = `https://${this.project}.${subdomain}.workers.dev`;

    if (this.watch) {
      const update = () => this.deploy(url);
      this.bundler.on('bundle-end', update);
      if (this.site) {
        this.site.on('change', update);
      }
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
      name: this.project,
      site: this.site,
      kv: this.kv
    });

    logger.success(
      `Deployed worker to ${chalk.cyan.underline(url)}`,
      Date.now() - startTime
    );
  }

  dispose() {
    this.bundler.dispose();
    if (this.site) {
      this.site.dispose();
    }
    this.kv.dispose();
  }
}

export class DeployCommand {
  /**
   * @param {{ entry: string; name: string; route: string; purgeCache: boolean; site?: string; kv: string[]; }} args
   */
  constructor(args) {
    const {
      CLOUDFLARE_EMAIL,
      CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_API_KEY,
      CLOUDFLARE_ZONE_ID
    } = process.env;

/** XXX
    if (!CLOUDFLARE_EMAIL) {
      throw new Error('CLOUDFLARE_EMAIL environment variable is not defined.');
    }
*/
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
    this.site = args.site ? new StaticSite(args.site, false) : null;
    this.kv = new KV(args.kv, false);
  }

  async execute() {
    const startTime = Date.now();

    await Promise.all([
      this.bundler.bundle(),
      this.site ? this.site.init() : Promise.resolve(),
      this.kv.init()
    ]);

    logger.progress('Deploying worker...');

    const zoneName = await deploy({
      name: this.args.name,
      code: this.bundler.code,
      accountId: this.accountId,
      accountEmail: this.accountEmail,
      zoneId: this.zoneId,
      apiKey: this.apiKey,
      purgeCache: this.args.purgeCache,
      routePattern: this.args.route,
      site: this.site,
      kv: this.kv
    });

    const url = 'https://' + (this.args.route ? this.args.route : zoneName);
    logger.success(
      `Deployed worker to ${chalk.cyan.underline(url)}`,
      Date.now() - startTime
    );
  }

  dispose() {
    this.bundler.dispose();
    if (this.site) {
      this.site.dispose();
    }
    this.kv.dispose();
  }
}
