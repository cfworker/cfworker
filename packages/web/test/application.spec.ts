import { expect } from 'chai';
import { Application } from '../src/index.js';

describe('Application', () => {
  const url = new URL('https://example.com/');
  const env = {};
  const context = { waitUntil: () => {} };

  it('handles request', async () => {
    let received: Request | undefined = undefined;
    const dispatched = new Request(url);
    const app = new Application();
    app.use(ctx => {
      received = ctx.req.raw;
    });
    await app.handleRequest(dispatched, env, context);
    expect(received).to.equal(dispatched);
  });

  it('responds with middleware result', async () => {
    const app = new Application();
    app.use(ctx => {
      ctx.res.status = 201;
      ctx.res.body = 'hello world';
    });
    const response = await app.handleRequest(new Request(url), env, context);
    expect(response.status).to.equal(201);
    expect(await response.text()).to.equal('hello world');
  });

  it('cascades middleware', async () => {
    const app = new Application();
    app.use((ctx, next) => {
      ctx.res.status = 201;
      next();
    });
    app.use(ctx => {
      ctx.res.body = 'hello world';
    });
    const response = await app.handleRequest(new Request(url), env, context);
    expect(response.status).to.equal(201);
    expect(await response.text()).to.equal('hello world');
  });

  it('responds with 500 when exception occurs in middleware', async () => {
    const app = new Application();
    app.use(() => {
      throw new Error('kaboom');
    });
    const response = await app.handleRequest(new Request(url), env, context);
    expect(response.status).to.equal(500);
  });

  it('responds with 500 when non-error is thrown', async () => {
    const app = new Application();
    app.use(() => {
      throw undefined;
    });
    const response = await app.handleRequest(new Request(url), env, context);
    expect(response.status).to.equal(500);
  });
});
