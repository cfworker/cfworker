import watch from 'chokidar';
import { createHash } from 'crypto';
import { EventEmitter } from 'events';
import { createReadStream } from 'fs';
import glob from 'glob-promise';
import { basename, dirname, extname, join } from 'path';
import { logger } from './logger.js';

export class StaticSite extends EventEmitter {
  debounceHandle = setTimeout(() => {}, 0);

  ignored = ['**/node_modules/**/*'];

  /** @type {Record<string, string>} */
  manifest = {};

  /** @type {Record<string, string>} */
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
      this.watcher.on('all', () => {
        clearTimeout(this.debounceHandle);
        this.debounceHandle = setTimeout(() => this.read(), 300);
      });
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
        const absoluteFilename = join(directory, filename);
        let hash = '';
        try {
          const s = createReadStream(absoluteFilename);
          const hasher = createHash('md5');
          hasher.setEncoding('hex');
          await new Promise(resolve => {
            s.on('end', resolve);
            s.pipe(hasher);
          });
          hasher.end();
          hash = hasher.read().substr(0, 10);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            throw err;
          }
        }
        return {
          filename,
          hash,
          absoluteFilename
        };
      })
    );
    this.files = {};
    this.manifest = {};
    for (const { filename, absoluteFilename, hash } of files) {
      if (hash === '') {
        continue;
      }
      const ext = extname(filename);
      const key = join(
        dirname(filename),
        `${basename(filename, ext)}.${hash}${ext}`
      );
      this.files[key] = absoluteFilename;
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
