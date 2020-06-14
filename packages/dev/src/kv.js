import watch from 'chokidar';
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import { basename, extname } from 'path';
import { logger } from './logger.js';

/**
 * @typedef {object} KVItem
 * @property {string} key
 * @property {string} value
 * @property {boolean} base64
 */

/**
 * @typedef {object} KVNamespaceInit
 * @property {string} name
 * @property {KVItem[]} items
 */

export class KV extends EventEmitter {
  debounceHandle = setTimeout(() => {}, 0);

  /** @type {KVNamespaceInit[]} */
  namespaces = [];

  /**
   * @param {string[]} filenames
   * @param {boolean} [watch]
   */
  constructor(filenames, watch = false) {
    super();
    this.filenames = filenames;
    this.watch = watch;
  }

  async init() {
    if (this.filenames.length === 0) {
      return;
    }
    await this.read();
    if (this.watch) {
      this.watcher = watch.watch(this.filenames, {
        ignoreInitial: true
      });
      this.watcher.on('all', () => {
        clearTimeout(this.debounceHandle);
        this.debounceHandle = setTimeout(() => this.read(), 300);
      });
    }
  }

  async read() {
    const startTime = Date.now();
    logger.progress(`Reading KV files...`);
    this.namespaces = await Promise.all(
      this.filenames.map(async filename => {
        const ext = extname(filename);
        const name = basename(filename, ext);
        let items = [];
        try {
          const buffer = await fs.readFile(filename);
          items = JSON.parse(buffer.toString());
        } catch (err) {
          if (err.code !== 'ENOENT') {
            throw err;
          }
        }
        return { name, items };
      })
    );
    logger.success(
      `KV ready: ${this.namespaces
        .map(x => `${x.name} (${x.items.length})`)
        .join(', ')}`,
      Date.now() - startTime
    );
    this.emit('change');
  }

  dispose() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}
