import { expect } from 'chai';
import { Router } from '../src/router.js';

function createContext(method: string, path: string) {
  return {
    req: {
      method,
      url: new URL(`http://localhost${path}`),
      params: {}
    }
  } as any;
}

describe('Router', () => {
  it('matches GET route', async () => {
    const router = new Router();

    let called = false;

    router.get('/hello', async () => {
      called = true;
    });

    const ctx = createContext('GET', '/hello');

    await router.middleware(ctx, async () => {});

    expect(called).to.equal(true);
  });

  it('does not match wrong method', async () => {
    const router = new Router();

    let called = false;

    router.get('/hello', async () => {
      called = true;
    });

    const ctx = createContext('POST', '/hello');

    await router.middleware(ctx, async () => {});

    expect(called).to.equal(false);
  });

  it('extracts params', async () => {
    const router = new Router();

    router.get('/users/:id', async () => {});

    const ctx = createContext('GET', '/users/123');

    const resolved = router.resolve(ctx);

    expect(resolved).to.not.equal(undefined);
    expect(ctx.req.params.id).to.equal('123');
  });

  it('calls next if no route', async () => {
    const router = new Router();

    let nextCalled = false;

    const ctx = createContext('GET', '/unknown');

    await router.middleware(ctx, async () => {
      nextCalled = true;
    });

    expect(nextCalled).to.equal(true);
  });

  it('all() matches any method', async () => {
    const router = new Router();

    let called = false;

    router.all('/hello', async () => {
      called = true;
    });

    const ctx = createContext('PUT', '/hello');

    await router.middleware(ctx, async () => {});

    expect(called).to.equal(true);
  });
});
