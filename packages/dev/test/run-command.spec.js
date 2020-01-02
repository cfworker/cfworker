import assert from 'assert';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { RunCommand } from '../src/cli/run-command.js';

const port = 7000;

export async function assertBundlesJavaScriptWorker() {
  const entry = './test/fixtures/worker.js';
  const code = `
    import { status } from './status';
    addEventListener('fetch', e => e.respondWith(new Response('', { status })));`;
  await fs.outputFile(entry, code);
  await fs.outputFile(
    './test/fixtures/status.js',
    'export const status = 200;'
  );
  const command = new RunCommand({ entry, port, inspect: false, watch: false });
  await command.execute();
  const response = await fetch('http://localhost:7000');
  assert.equal(response.status, 200);
  command.dispose();
}

export async function assertBundlesTypeScriptWorker() {
  const entry = './test/fixtures/worker.ts';
  const code = `
    import { status } from './status';
    // @ts-ignore
    addEventListener('fetch', e => e.respondWith(new Response('', { status })));`;
  await fs.outputFile(entry, code);
  await fs.outputFile(
    './test/fixtures/status.js',
    'export const status = 200;'
  );
  const command = new RunCommand({ entry, port, inspect: false, watch: false });
  await command.execute();
  const response = await fetch('http://localhost:7000');
  assert.equal(response.status, 200);
  command.dispose();
}

export async function assertRespondsWith503WhenFetchListenerIsNotAdded() {
  const entry = './test/fixtures/worker.js';
  const code = `console.log('hello world')`;
  await fs.outputFile(entry, code);
  const command = new RunCommand({ entry, port, inspect: false, watch: false });
  await command.execute();
  const response = await fetch('http://localhost:7000');
  assert.equal(response.status, 503);
  command.dispose();
}

export async function assertWatchesForChanges() {
  const entry = './test/fixtures/worker.js';
  let code = `console.log('hello world')`;
  await fs.outputFile(entry, code);
  const command = new RunCommand({ entry, port, inspect: false, watch: true });
  await command.execute();
  let response = await fetch('http://localhost:7000');
  assert.equal(response.status, 503);

  const updated = new Promise(resolve =>
    command.host.on('worker-updated', resolve)
  );
  code = `
    // @ts-ignore
    addEventListener('fetch', e => e.respondWith(new Response('', { status: 200 })))`;
  await fs.outputFile(entry, code);
  await updated;
  response = await fetch('http://localhost:7000');
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
  const command = new RunCommand({ entry, port, inspect: false, watch: false });
  await command.execute();
  const response = await fetch('http://localhost:7000', {
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
  const command = new RunCommand({ entry, port, inspect: false, watch: false });
  await command.execute();

  const response = await fetch('http://localhost:7000');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('set-cookie'), 'test cookie');
  command.dispose();
}
