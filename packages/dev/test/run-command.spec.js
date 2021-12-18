import assert from 'assert';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { RunCommand } from '../src/cli/run-command.js';

const port = 1234;

export async function assertBundlesJavaScriptWorker() {
  const entry = './test/fixtures/worker.js';
  const code = `
    import { status } from './status.js';
    addEventListener('fetch', e => e.respondWith(new Response('', { status })));`;
  await fs.outputFile(entry, code);
  await fs.outputFile(
    './test/fixtures/status.js',
    'export const status = 200;'
  );
  const command = new RunCommand({
    entry,
    port,
    inspect: false,
    watch: false,
    check: false,
    kv: []
  });
  await command.execute();
  const response = await fetch('http://localhost:1234');
  assert.equal(response.status, 200);
  command.dispose();
}

export async function assertBundlesTypeScriptWorker() {
  const entry = './test/fixtures/worker.ts';
  const code = `
    import { status } from './status.js';
    // @ts-ignore
    addEventListener('fetch', e => e.respondWith(new Response('', { status })));`;
  await fs.outputFile(entry, code);
  await fs.outputFile(
    './test/fixtures/status.js',
    'export const status = 200;'
  );
  const command = new RunCommand({
    entry,
    port,
    inspect: false,
    watch: false,
    check: true,
    kv: []
  });
  await command.execute();
  const response = await fetch('http://localhost:1234');
  assert.equal(response.status, 200);
  command.dispose();
}

export async function assertRespondsWith503WhenFetchListenerIsNotAdded() {
  const entry = './test/fixtures/worker.js';
  const code = `console.log('hello world')`;
  await fs.outputFile(entry, code);
  const command = new RunCommand({
    entry,
    port,
    inspect: false,
    watch: false,
    check: true,
    kv: []
  });
  await command.execute();
  const response = await fetch('http://localhost:1234');
  assert.equal(response.status, 503);
  command.dispose();
}

export async function assertWatchesForChanges() {
  const entry = './test/fixtures/worker.js';
  let code = `console.log('hello world')`;
  await fs.outputFile(entry, code);
  const command = new RunCommand({
    entry,
    port,
    inspect: false,
    watch: true,
    check: true,
    kv: []
  });
  await command.execute();
  let response = await fetch('http://localhost:1234');
  assert.equal(response.status, 503);

  const updated = new Promise(resolve =>
    command.host.on('worker-updated', resolve)
  );
  code = `
    // @ts-ignore
    addEventListener('fetch', e => e.respondWith(new Response('', { status: 200 })))`;
  await fs.outputFile(entry, code);
  await updated;
  response = await fetch('http://localhost:1234');
  assert.equal(response.status, 200);

  command.dispose();
}

export async function assertCanReadRequestCookieHeader() {
  const cookie = 'test cookie';
  const entry = './test/fixtures/worker.js';
  const code = `
    addEventListener('fetch', event => {
      const cookie = event.request.headers.get('cookie');
      const response = new Response(cookie, { status: 200 });
      event.respondWith(response);
    });`;
  await fs.outputFile(entry, code);
  const { RunCommand } = await import('../src/cli/run-command.js');
  const command = new RunCommand({
    entry,
    port,
    inspect: false,
    watch: false,
    check: true,
    kv: []
  });
  await command.execute();
  const response = await fetch('http://localhost:1234', {
    headers: { cookie }
  });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), cookie);
  command.dispose();
}

export async function assertCanRespondWithSetCookieHeader() {
  const cookie = 'test cookie';
  const entry = './test/fixtures/worker.js';
  const code = `
    addEventListener('fetch', event => {
      const response = new Response('', { status: 200 });
      response.headers.set('set-cookie', '${cookie}');
      event.respondWith(response);
    });`;
  await fs.outputFile(entry, code);
  const { RunCommand } = await import('../src/cli/run-command.js');
  const command = new RunCommand({
    entry,
    port,
    inspect: false,
    watch: false,
    check: true,
    kv: []
  });
  await command.execute();

  const response = await fetch('http://localhost:1234');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('set-cookie'), 'test cookie');
  command.dispose();
}

export async function assertCanReadWriteCache() {
  const entry = './test/fixtures/worker.js';
  const code = `
    addEventListener('fetch', async e => {
      await caches.default.put('/', new Response(undefined, { status: 201, statusText: 'no content' }));
      const response = await caches.default.match('/');
      e.respondWith(response);
    });`;
  await fs.outputFile(entry, code);
  const command = new RunCommand({
    entry,
    port,
    inspect: false,
    watch: false,
    check: false,
    kv: []
  });
  await command.execute();
  const response = await fetch('http://localhost:1234');
  assert.equal(response.status, 201);
  assert.equal(response.statusText, 'no content');
  command.dispose();
}

export async function assertCanServeStaticSite() {
  const entry = './test/fixtures/worker.js';
  const code = `
    addEventListener('fetch', async e => {
      const key = JSON.parse(__STATIC_CONTENT_MANIFEST)['index.html'];
      const body = await __STATIC_CONTENT.get(key, 'stream');
      e.respondWith(new Response(body));
    });`;
  await fs.outputFile(entry, code);
  await fs.outputFile(
    './test/fixtures/public/index.html',
    '<body>hello world</body>'
  );
  await fs.outputFile(
    './test/fixtures/public/node_modules/ignored.js',
    'var x = 1;'
  );
  await fs.outputFile('./test/fixtures/public/foo/bar.js', 'var bar = 2;');
  const command = new RunCommand({
    entry,
    port,
    inspect: false,
    watch: true,
    check: false,
    site: 'test/fixtures/public',
    kv: []
  });
  await command.execute();
  const response = await fetch('http://localhost:1234');
  const html = await response.text();
  assert.equal(html, '<body>hello world</body>');

  const updated = new Promise(resolve =>
    command.host.on('worker-updated', resolve)
  );
  await fs.outputFile(
    './test/fixtures/public/index.html',
    '<body>hello world 2</body>'
  );
  await updated;
  const response2 = await fetch('http://localhost:1234');
  const html2 = await response2.text();
  assert.equal(html2, '<body>hello world 2</body>');

  command.dispose();
}

export async function assertCanCreateKVNamespace() {
  const entry = './test/fixtures/worker.js';
  const code = `
    addEventListener('fetch', async e => {
      const body = await greetings.get('hello', 'text');
      e.respondWith(new Response(body));
    });`;
  await fs.outputFile(entry, code);
  await fs.outputFile(
    './test/fixtures/greetings.json',
    '[{ "key": "hello", "value": "world", "base64": false }]'
  );
  const command = new RunCommand({
    entry,
    port,
    inspect: false,
    watch: true,
    check: false,
    kv: ['./test/fixtures/greetings.json']
  });
  await command.execute();
  const response = await fetch('http://localhost:1234');
  const html = await response.text();
  assert.equal(html, 'world');

  const updated = new Promise(resolve =>
    command.host.on('worker-updated', resolve)
  );
  await fs.outputFile(
    './test/fixtures/greetings.json',
    '[{ "key": "hello", "value": "world 2", "base64": false }]'
  );
  await updated;
  const response2 = await fetch('http://localhost:1234');
  const html2 = await response2.text();
  assert.equal(html2, 'world 2');

  command.dispose();
}
