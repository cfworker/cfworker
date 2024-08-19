import { readdirSync, readFileSync, writeFileSync } from 'fs';

export async function generatePackageListMarkdown() {
  const packages = readdirSync('packages');
  const npm = 'https://www.npmjs.com/package/';
  let markdown = `# cfworker

[![Release](https://github.com/cfworker/cfworker/actions/workflows/release.yml/badge.svg)](https://github.com/cfworker/cfworker/actions/workflows/release.yml)

A collection of packages optimized for Cloudflare Workers and service workers.

`;
  for (const name of packages) {
    if (name === 'worker-types' || name === 'examples' || name === 'site') {
      continue;
    }
    try {
      const buffer = readFileSync(`packages/${name}/package.json`);
      const pkg = JSON.parse(buffer.toString());
      markdown += `## ${pkg.name}

${
  name === 'dev'
    ? ''
    : `![](https://badgen.net/bundlephobia/minzip/${pkg.name})
![](https://badgen.net/bundlephobia/min/${pkg.name})
![](https://badgen.net/bundlephobia/dependency-count/${pkg.name})
![](https://badgen.net/bundlephobia/tree-shaking/${pkg.name})
![](https://badgen.net/npm/types/${pkg.name}?icon=typescript)`
}


${pkg.description}


[readme](${pkg.homepage}) | [npm](${npm}${pkg.name})

`;
    } catch {}
  }
  let readme = (await readFileSync('README.md')).toString();
  readme = readme.replace(
    /(.|\r|\n)*## contributing/gm,
    markdown + '\n## contributing'
  );
  writeFileSync('README.md', readme);
}

generatePackageListMarkdown();
