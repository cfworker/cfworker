// https://github.com/swansontec/rfc4648.js/pull/36
import { readFile, writeFile } from 'fs/promises';
const filename = `${import.meta.dirname}/node_modules/rfc4648/lib/src/index.d.ts`;
const original = await readFile(filename, { encoding: 'utf8' });
const patched = original.replace(`from './codec';`, `from './codec.js';`);
await writeFile(filename, patched);
