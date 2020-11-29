import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Context } from '../src/context.js';
import { HttpError } from '../src/http-error.js';
import { validate } from '../src/validate.js';

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

  it('validates JSON body', async () => {
    const middleware = validate({ body: { required: ['id'] } });
    let request = new Request('https://a.b/', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json'
      }
    });
    let context = new Context({ request });
    let resolved = false;
    try {
      await middleware(context, async () => (resolved = true));
    } catch (err) {
      expect(err instanceof HttpError && err.status === 400).to.be.true;
    }
    // verify json read
    await context.req.body.json();
    expect(resolved).to.be.false;

    request = new Request('https://a.b/', {
      method: 'POST',
      body: JSON.stringify({ id: 'world' }),
      headers: {
        'content-type': 'application/json'
      }
    });
    context = new Context({ request });
    await middleware(context, async () => (resolved = true));
    // verify json read
    await context.req.body.json();
    expect(resolved).to.be.true;
  });

  it('validates URL encoded body', async () => {
    const middleware = validate({ body: { required: ['id'] } });
    let request = new Request('https://a.b/', {
      method: 'POST',
      body: new URLSearchParams({ hello: 'world' })
    });
    let context = new Context({ request });
    let resolved = false;
    try {
      await middleware(context, async () => (resolved = true));
    } catch (err) {
      expect(err instanceof HttpError && err.status === 400).to.be.true;
    }
    // verify formData read
    await context.req.body.formData();
    expect(resolved).to.be.false;

    request = new Request('https://a.b/', {
      method: 'POST',
      body: new URLSearchParams({ id: 'world' })
    });
    context = new Context({ request });
    await middleware(context, async () => (resolved = true));
    // verify formData read
    await context.req.body.formData();
    expect(resolved).to.be.true;
  });

  it('validates multi-part form encoded body', async () => {
    const middleware = validate({ body: { required: ['id'] } });
    let body = new FormData();
    body.set('hello', 'world');
    let request = new Request('https://a.b/', {
      method: 'POST',
      body
    });
    let context = new Context({ request });
    let resolved = false;
    try {
      await middleware(context, async () => (resolved = true));
    } catch (err) {
      expect(err instanceof HttpError && err.status === 400).to.be.true;
    }
    // verify formData read
    await context.req.body.formData();
    expect(resolved).to.be.false;

    body = new FormData();
    body.set('id', 'world');
    request = new Request('https://a.b/', {
      method: 'POST',
      body
    });
    context = new Context({ request });
    await middleware(context, async () => (resolved = true));
    // verify formData read
    await context.req.body.formData();
    expect(resolved).to.be.true;
  });
});
