import watch from 'chokidar';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import glob from 'glob-promise';
import { basename, dirname, extname, join } from 'path';
import { logger } from './logger.js';

const empty = Buffer.from('');

export class StaticSite extends EventEmitter {
  ignored = ['**/node_modules/**/*'];

  /** @type {Record<string, string>} */
  manifest = {};

  /** @type {Record<string, Buffer>} */
  files = {};

  /**
   * @param {string | null} [directory]
   * @param {boolean} [watch]
   */
  constructor(directory = null, watch = false) {
    super();
    this.directory = directory;
    this.watch = watch;
  }

  async init() {
    if (this.directory === null) {
      return;
    }
    await this.read();
    if (this.watch) {
      this.watcher = watch.watch(this.directory, {
        ignoreInitial: true,
        ignored: this.ignored
      });
      this.watcher.on('all', () => this.read());
    }
  }

  async read() {
    if (this.directory === null) {
      throw new Error('directory is null');
    }
    const directory = this.directory;
    logger.progress(
      `Generating static site manifest for "${this.directory}"...`
    );
    const startTime = Date.now();
    const matches = await glob('**/*', {
      nodir: true,
      ignore: this.ignored,
      cwd: directory
    });
    const files = await Promise.all(
      matches.map(async filename => {
        let content = empty;
        try {
          content = await fs.readFile(join(directory, filename));
        } catch (err) {
          if (err.code !== 'ENOENT') {
            throw err;
          }
        }
        const hash = shortHash(content);
        return {
          filename,
          hash,
          content
        };
      })
    );
    this.files = {};
    this.manifest = {};
    for (const { filename, content, hash } of files) {
      const ext = extname(filename);
      const key = join(
        dirname(filename),
        `${basename(filename, ext)}.${hash}${ext}`
      );
      this.files[key] = content;
      this.manifest[filename] = key;
    }
    logger.success(`Site manifest generated`, Date.now() - startTime);
    this.emit('change');
  }

  dispose() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}

/**
 * @param {import('crypto').BinaryLike} data
 */
function shortHash(data) {
  return crypto.createHash('md5').update(data).digest('hex').substr(0, 10);
}
