import fs from 'fs-extra';
import { dirname } from 'path';
import { Bundler } from '../bundler.js';

export class BuildCommand {
  /**
   * @param {{ entry: string; watch: boolean; outFile: string; }} args
   */
  constructor(args) {
    const outDir = dirname(args.outFile);
    this.bundler = new Bundler([args.entry], args.watch);
    this.bundler.on('bundle-end', async () => {
      await fs.ensureDir(outDir);
      fs.writeFile(args.outFile, this.bundler.code);
    });
  }

  execute() {
    return this.bundler.bundle();
  }

  dispose() {
    this.bundler.dispose();
  }
}
