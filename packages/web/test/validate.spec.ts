import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Context } from '../src/context';
import { HttpError } from '../src/http-error';
import { validate } from '../src/validate';

describe('validate', () => {
  const middleware = validate({
    body: { required: ['id'] },
    params: { required: ['id'] },
    search: { required: ['category'] },
    headers: {
      required: ['content-type'],
      properties: { 'content-type': { const: 'application/json' } }
    }
  });

  it('validates request', async () => {
    const request = new Request('https://a.b/items/899934?category=recent', {
      method: 'POST',
      body: JSON.stringify({ id: '899934' }),
      headers: {
        'content-type': 'application/json'
      }
    });
    const context = new Context({ request });
    context.req.params.id = '899934';
    let resolved = false;
    await middleware(context, async () => (resolved = true));
    expect(resolved).to.be.true;
  });

  it('validates params', async () => {
    const request = new Request('https://a.b/items/899934?category=recent', {
      method: 'POST',
      body: JSON.stringify({ id: '899934' }),
      headers: {
        'content-type': 'application/json'
      }
    });
    const context = new Context({ request });
    let resolved = false;
    try {
      await middleware(context, async () => (resolved = true));
    } catch (err) {
      expect(err instanceof HttpError && err.status === 400).to.be.true;
    }
    expect(resolved).to.be.false;
  });

  it('validates headers', async () => {
    const request = new Request('https://a.b/items/899934?category=recent', {
      method: 'POST',
      body: JSON.stringify({ id: '899934' }),
      headers: {
        'content-type': 'text/plain'
      }
    });
    const context = new Context({ request });
    context.req.params.id = '899934';
    let resolved = false;
    try {
      await middleware(context, async () => (resolved = true));
    } catch (err) {
      expect(err instanceof HttpError && err.status === 400).to.be.true;
    }
    expect(resolved).to.be.false;
  });

  it('validates search', async () => {
    const request = new Request('https://a.b/items/899934', {
      method: 'POST',
      body: JSON.stringify({ id: '899934' }),
      headers: {
        'content-type': 'application/json'
      }
    });
    const context = new Context({ request });
    context.req.params.id = '899934';
    let resolved = false;
    try {
      await middleware(context, async () => (resolved = true));
    } catch (err) {
      expect(err instanceof HttpError && err.status === 400).to.be.true;
    }
    expect(resolved).to.be.false;
  });

  it('validates body', async () => {
    const request = new Request('https://a.b/items/899934?category=recent', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json'
      }
    });
    const context = new Context({ request });
    context.req.params.id = '899934';
    let resolved = false;
    try {
      await middleware(context, async () => (resolved = true));
    } catch (err) {
      expect(err instanceof HttpError && err.status === 400).to.be.true;
    }
    expect(resolved).to.be.false;
  });
});
