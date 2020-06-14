import assert from 'assert';
import fs from 'fs-extra';
import { TestCommand } from '../src/cli/test-command.js';

const port = 7000;
const passingSpec = `
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('foo', () => {
  it('bar', () => {
    expect('a').to.equal('a');
  });
});`;
const failingSpec = `
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('hello', () => {
  it('world', () => {
    expect('b').to.equal('c');
  });
});`;

export async function assertBundlesJavaScriptTests() {
  await fs.outputFile('./test/fixtures/a.spec.js', passingSpec);
  await fs.outputFile('./test/fixtures/b.spec.js', failingSpec);
  const command = new TestCommand({
    globs: ['test/fixtures/*.spec.js'],
    port,
    inspect: false,
    watch: true,
    check: true,
    kv: []
  });

  let testEnd = new Promise(resolve =>
    command.testHost.on('test-end', resolve)
  );
  command.execute();
  assert.equal(await testEnd, 1);

  testEnd = new Promise(resolve => command.testHost.on('test-end', resolve));
  await fs.outputFile('./test/fixtures/b.spec.js', passingSpec);
  assert.equal(await testEnd, 0);

  command.dispose();
}

export async function assertBundlesTypeScriptTests() {
  await fs.outputFile('./test/fixtures/a.spec.ts', passingSpec);
  await fs.outputFile('./test/fixtures/b.spec.ts', failingSpec);
  const command = new TestCommand({
    globs: ['test/fixtures/*.spec.ts'],
    port,
    inspect: false,
    watch: true,
    check: true,
    kv: []
  });

  let testEnd = new Promise(resolve =>
    command.testHost.on('test-end', resolve)
  );
  command.execute();
  assert.equal(await testEnd, 1);

  testEnd = new Promise(resolve => command.testHost.on('test-end', resolve));
  await fs.outputFile('./test/fixtures/b.spec.ts', passingSpec);
  assert.equal(await testEnd, 0);

  command.dispose();
}

export async function assertSupportsStaticSiteTests() {
  const siteSpec = `
    import { expect } from 'chai';
    import { describe, it } from 'mocha';

    describe('manifest', () => {
      const manifest = JSON.parse(__STATIC_CONTENT_MANIFEST);
      it('has index.html', () => {
        expect(manifest['index.html']).to.equal('index.503adfccd7.html');
      });
    });`;
  await fs.outputFile('./test/fixtures/site.spec.js', siteSpec);
  await fs.outputFile(
    './test/fixtures/public/index.html',
    '<body>hello world</body>'
  );
  const command = new TestCommand({
    globs: ['test/fixtures/*.spec.js'],
    port,
    inspect: false,
    watch: true,
    check: true,
    site: 'test/fixtures/public',
    kv: []
  });

  let testEnd = new Promise(resolve =>
    command.testHost.on('test-end', resolve)
  );
  command.execute();
  assert.equal(await testEnd, 0);

  testEnd = new Promise(resolve => command.testHost.on('test-end', resolve));
  await fs.outputFile(
    './test/fixtures/public/index.html',
    '<body>hello world 2</body>'
  );
  assert.equal(await testEnd, 1);

  command.dispose();
}
