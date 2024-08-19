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
