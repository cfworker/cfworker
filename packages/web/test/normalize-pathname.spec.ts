import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Context } from '../src/context.js';
import { HttpError } from '../src/http-error.js';
import {
  normalizePathname,
  normalizePathnameMiddleware
} from '../src/normalize-pathname.js';

describe('normalizePathname', () => {
  it('normalizes pathname', () => {
    expect(normalizePathname('/hello-%28world%29')).to.equal('/hello-(world)');
    expect(normalizePathname('/caf\u00E9')).to.equal('/café');
    expect(normalizePathname('/cafe\u0301')).to.equal('/café');
    expect(normalizePathname('/hello//world')).to.equal('/hello/world');
    expect(normalizePathname('/JavaScript_шеллы')).to.equal(
      '/JavaScript_шеллы'
    );
  });
});

describe('normalizePathnameMiddleware', () => {
  function contextFactory(pathname: string) {
    return new Context(
      new Request(`https://foo.com${pathname}`),
      {},
      { waitUntil() {} }
    );
  }

  it('normalizes pathname', async () => {
    let resolved = false;
    let context = contextFactory('/hello-%28world%29');
    await normalizePathnameMiddleware(context, async () => {
      resolved = true;
    });
    expect(resolved).to.be.true;
    expect(context.req.url.pathname).to.equal('/hello-(world)');

    resolved = false;
    context = contextFactory('/caf\u00E9');
    await normalizePathnameMiddleware(context, async () => {
      resolved = true;
    });
    expect(resolved).to.be.true;
    expect(context.req.url.pathname).to.equal('/caf%C3%A9');

    resolved = false;
    context = contextFactory('/cafe\u0301');
    await normalizePathnameMiddleware(context, async () => {
      resolved = true;
    });
    expect(resolved).to.be.true;
    expect(context.req.url.pathname).to.equal('/caf%C3%A9');

    resolved = false;
    context = contextFactory('/hello//world');
    await normalizePathnameMiddleware(context, async () => {
      resolved = true;
    });
    expect(resolved).to.be.true;
    expect(context.req.url.pathname).to.equal('/hello/world');

    resolved = false;
    context = contextFactory('/JavaScript_шеллы');
    await normalizePathnameMiddleware(context, async () => {
      resolved = true;
    });
    expect(resolved).to.be.true;
    expect(context.req.url.pathname).to.equal(
      '/JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B'
    );
  });

  it('throws 400 when escape sequence cannot be represented', async () => {
    const context = new Context(
      new Request('https://foo.com/%E0%A4%A'),
      {},
      { waitUntil() {} }
    );
    let resolved = false;
    let error = new Error();
    try {
      await normalizePathnameMiddleware(context, async () => {
        resolved = true;
      });
    } catch (err) {
      error = err;
    }
    expect(resolved).to.be.false;
    expect(error instanceof HttpError).to.be.true;
    expect(error.message).to.eql('Bad Request');
  });
});
