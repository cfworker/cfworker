import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

export async function loadEnv(default_NODE_ENV = 'development') {
  const NODE_ENV = (process.env.NODE_ENV =
    process.env.NODE_ENV || default_NODE_ENV);
  const basenames = [
    `.env.${NODE_ENV}.local`,
    `.env.${NODE_ENV}`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    ...(NODE_ENV === 'test' ? [] : ['.env.local']),
    '.env'
  ];

  for (const basename of basenames) {
    const path = join(process.cwd(), basename);
    if (!existsSync(path)) {
      continue;
    }
    dotenv.config({ path });
  }
}
