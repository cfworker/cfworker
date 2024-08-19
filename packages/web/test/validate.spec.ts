import type { Schema } from '@cfworker/json-schema';
import { expect } from 'chai';
import { set } from 'jsonpointer';
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
    const context = new Context(request, {}, { waitUntil() {} });
    context.req.params.id = '899934';
    let resolved = false;
    await middleware(context, async () => {
      resolved = true;
    });
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
    const context = new Context(request, {}, { waitUntil() {} });
    let resolved = false;
    try {
      await middleware(context, async () => {
        resolved = true;
      });
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
    const context = new Context(request, {}, { waitUntil() {} });
    context.req.params.id = '899934';
    let resolved = false;
    try {
      await middleware(context, async () => {
        resolved = true;
      });
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
    const context = new Context(request, {}, { waitUntil() {} });
    context.req.params.id = '899934';
    let resolved = false;
    try {
      await middleware(context, async () => {
        resolved = true;
      });
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
    let context = new Context(request, {}, { waitUntil() {} });
    let resolved = false;
    try {
      await middleware(context, async () => {
        resolved = true;
      });
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
    context = new Context(request, {}, { waitUntil() {} });
    await middleware(context, async () => {
      resolved = true;
    });
    // verify json read
    await context.req.body.json();
    expect(resolved).to.be.true;
  });

  it('validates URL encoded body', async () => {
    const middleware = validate({ body: { required: ['id'] } });
    let request = new Request('https://a.b/', {
      method: 'POST',
      body: new URLSearchParams({ hello: 'world' }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    });
    let context = new Context(request, {}, { waitUntil() {} });
    let resolved = false;
    try {
      await middleware(context, async () => {
        resolved = true;
      });
    } catch (err) {
      expect(err instanceof HttpError && err.status === 400).to.be.true;
    }
    // verify formData read
    await context.req.body.formData();
    expect(resolved).to.be.false;

    request = new Request('https://a.b/', {
      method: 'POST',
      body: new URLSearchParams({ id: 'world' }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded' // miniflare bug
      }
    });
    context = new Context(request, {}, { waitUntil() {} });
    await middleware(context, async () => {
      resolved = true;
    });
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
    let context = new Context(request, {}, { waitUntil() {} });
    let resolved = false;
    try {
      await middleware(context, async () => {
        resolved = true;
      });
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
    context = new Context(request, {}, { waitUntil() {} });
    await middleware(context, async () => {
      resolved = true;
    });
    // verify formData read
    await context.req.body.formData();
    expect(resolved).to.be.true;
  });

  it('supports custom parsers', async () => {
    function parseForm(data: FormData | URLSearchParams) {
      const obj = Object.create(null);
      for (const [pointer, value] of data) {
        set(obj, '/' + pointer, value);
      }
      return obj;
    }

    const validObj = { a: ['b', 'c'] };

    const schema: Schema = {
      type: 'object',
      const: validObj
    };

    const stringified = new URLSearchParams({
      'a/0': 'b',
      'a/1': 'c'
    });

    const middleware = validate({ search: schema, body: schema }, parseForm);

    let request = new Request('https://a.b/?' + stringified, {
      method: 'POST',
      body: new URLSearchParams(stringified),
      headers: {
        'content-type': 'application/x-www-form-urlencoded' // miniflare bug
      }
    });
    let resolved = false;
    await middleware(new Context(request, {}, { waitUntil() {} }), async () => {
      resolved = true;
    });
    expect(resolved).to.be.true;

    const form = new FormData();
    form.append('a/0', 'b');
    form.append('a/1', 'c');
    request = new Request('https://a.b/?' + stringified, {
      method: 'POST',
      body: form
    });
    await middleware(new Context(request, {}, { waitUntil() {} }), async () => {
      resolved = true;
    });
    expect(resolved).to.be.true;
  });
});
