import mocha from 'mocha/mocha.js';

mocha.setup({
  ui: 'bdd',
  reporter: 'spec',
  color: true
});

// @ts-ignore  TypeError: Cannot read properties of undefined (reading 'search') at mocha2.run
globalThis.location = {
  origin: 'https://example.com',
  host: 'example.com',
  hostname: 'example.com',
  pathname: '/',
  search: '',
  hash: ''
};

// @ts-ignore
mocha.checkLeaks();

let running = false;

export default {
  async fetch() {
    if (running) {
      return new Response('Already running', { status: 400 });
    }
    running = true;

    const result = await new Promise(resolve => mocha.run(resolve));
    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  }
};
