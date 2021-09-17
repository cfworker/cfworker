import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Application } from '../src/index.js';

describe('Application', () => {
  it('listens', () => {
    let received: Request | undefined = undefined;
    const dispatched = new Request('/');
    const app = new Application();
    app.use(ctx => {
      received = ctx.req.raw;
    });
    app.listen();
    self.dispatchEvent(new MockFetchEvent(dispatched));
    expect(received).to.equal(dispatched);
  });

  it('responds with middleware result', async () => {
    const app = new Application();
    app.use(ctx => {
      ctx.res.status = 201;
      ctx.res.body = 'hello world';
    });
    app.listen();
    const event = new MockFetchEvent(new Request('/'));
    self.dispatchEvent(event);
    const response: Response = await event.__responded__;
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
    app.listen();
    const event = new MockFetchEvent(new Request('/'));
    self.dispatchEvent(event);
    const response: Response = await event.__responded__;
    expect(response.status).to.equal(201);
    expect(await response.text()).to.equal('hello world');
  });

  it('responds with 500 when exception occurs in middleware', async () => {
    const app = new Application();
    app.use(() => {
      throw new Error('kaboom');
    });
    app.listen();
    const event = new MockFetchEvent(new Request('/'));
    self.dispatchEvent(event);
    const response: Response = await event.__responded__;
    expect(response.status).to.equal(500);
  });

  it('responds with 500 when non-error is thrown', async () => {
    const app = new Application();
    app.use(() => {
      throw undefined;
    });
    app.listen();
    const event = new MockFetchEvent(new Request('/'));
    self.dispatchEvent(event);
    const response: Response = await event.__responded__;
    expect(response.status).to.equal(500);
  });
});

export class MockFetchEvent extends Event {
  public readonly __responded__: Promise<Response>;
  public respondWith!: (response: Response) => void;

  constructor(public readonly request: Request) {
    super('fetch');
    this.__responded__ = new Promise(resolve => (this.respondWith = resolve));
  }

  passThroughOnException() {}

  waitUntil() {}
}
