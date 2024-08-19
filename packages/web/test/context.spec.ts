import { expect } from 'chai';
import { Context } from '../src/context.js';

describe('Context', () => {
  const factory = () => {
    const request = new Request('https://foo.com/hello-%28world%29', {
      method: 'POST',
      body: JSON.stringify({ foo: 'bar' })
    });
    request.headers.set('accept', 'text/html');
    request.headers.set('cookie', 'ping=pong;beep=boop;');
    return new Context(request, {}, { waitUntil: () => {} });
  };

  it('exposes cookies', () => {
    const context = factory();
    expect(context.cookies.get('ping')).to.equal('pong');
  });

  it('exposes FetchEvent.waitUntil', () => {
    const context = factory();
    expect(() => context.waitUntil(Promise.resolve())).not.throw();
  });

  it('exposes reponse builder', () => {
    const context = factory();
    context.res.status = 201;
    expect(context.res.statusText).to.equal('Created');
  });
});
