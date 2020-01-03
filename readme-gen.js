import { readFileSync, readdirSync, writeFileSync } from 'fs';

export async function generatePackageListMarkdown() {
  const packages = readdirSync('packages');
  const npm = 'https://www.npmjs.com/package/';
  let markdown = '## packages\n\n';
  for (const name of packages) {
    try {
      const buffer = readFileSync(`packages/${name}/package.json`);
      const pkg = JSON.parse(buffer.toString());
      markdown += `- \`${pkg.name}\`: [readme](${pkg.homepage}) | [npm](${npm}${pkg.name})\n\n`;
      markdown += `    ${pkg.description}\n`;
    } catch {}
  }
  let readme = (await readFileSync('README.md')).toString();
  readme = readme.replace(/## packages(.|\r|\n)*##/gm, markdown + '\n##');
  writeFileSync('README.md', readme);
}

generatePackageListMarkdown();
