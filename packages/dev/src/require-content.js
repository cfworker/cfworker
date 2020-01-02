import { readFileSync } from 'fs';
import module from 'module';
import { extname } from 'path';
import { fileURLToPath } from 'url';

/** @type {Map<string, { content: string; type: string;}>} */
const packageContent = new Map();

/**
 * @param {string} id
 * @param {string} relativeTo
 */
export function requireContent(id, relativeTo) {
  if (!packageContent.has(id)) {
    const require = module.createRequire(fileURLToPath(relativeTo));
    // @ts-ignore
    const path = require.resolve(id);
    const content = readFileSync(path).toString();
    const type =
      extname(path) === '.css' ? 'text/css' : 'application/javascript';
    packageContent.set(id, { content, type });
  }
  const result = packageContent.get(id);
  if (result === undefined) {
    throw new Error(`unable to resolve ${id} relative to ${relativeTo}.`);
  }
  return result;
}
