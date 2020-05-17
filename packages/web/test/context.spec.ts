import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Context } from '../src/context';

declare var FetchEvent: any;

describe('Context', () => {
  const request = new Request('https://foo.com/hello-%28world%29', {
    method: 'POST',
    body: JSON.stringify({ foo: 'bar' })
  });
  request.headers.set('accept', 'text/html');
  request.headers.set('cookie', 'ping=pong;beep=boop;');
  const context = new Context(new FetchEvent(request));

  it('exposes cookies', () => {
    expect(context.cookies.get('ping')).to.equal('pong');
  });

  it('exposes FetchEvent.waitUntil', () => {
    expect(() => context.waitUntil(Promise.resolve())).not.throw();
  });

  it('exposes reponse builder', () => {
    context.res.status = 201;
    expect(context.res.statusText).to.equal('Created');
  });

  it('exposes respondWith', async () => {
    context.respondWith(new Response('', { status: 200 }));
    await context.responded;
  });
});
