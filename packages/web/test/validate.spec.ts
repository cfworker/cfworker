import type { Schema } from '@cfworker/json-schema';
import { expect } from 'chai';
import { set } from 'jsonpointer';
import { Context } from '../src/context.js';
import { HttpError } from '../src/http-error.js';
import { parseEntries } from '../src/parse-entries.js';
import { type RequestParser, validate } from '../src/validate.js';

async function validateSearch(
  query: string,
  schema: Schema,
  parser?: RequestParser
) {
  const request = new Request(`https://a.b/?${query}`);
  const context = new Context(request, {}, { waitUntil() {} });
  const middleware = validate({ search: schema }, parser);
  let error: unknown;
  let invoked = false;

  try {
    await middleware(context, async () => {
      invoked = true;
    });
  } catch (err) {
    error = err;
  }

  return { context, error, invoked };
}

async function validateForm(
  body: URLSearchParams | FormData,
  schema: Schema,
  parser?: RequestParser
) {
  const request = new Request('https://a.b/', { method: 'POST', body });
  const context = new Context(request, {}, { waitUntil() {} });
  const middleware = validate({ body: schema }, parser);
  let error: unknown;
  let invoked = false;

  try {
    await middleware(context, async () => {
      invoked = true;
    });
  } catch (err) {
    error = err;
  }

  return { context, error, invoked };
}

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
    context.req.params['id'] = '899934';
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
    context.req.params['id'] = '899934';
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
    context.req.params['id'] = '899934';
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

  describe('default entry parser', () => {
    it('parses a single value as a string', () => {
      expect(parseEntries(new URLSearchParams('q=a'))).to.deep.equal({
        q: 'a'
      });
    });

    it('parses two repeated values as an ordered array', () => {
      expect(parseEntries(new URLSearchParams('q=a&q=b'))).to.deep.equal({
        q: ['a', 'b']
      });
    });

    it('preserves the order of three or more repeated values', () => {
      expect(
        parseEntries(new URLSearchParams('q=a&q=b&q=c&q=d'))
      ).to.deep.equal({ q: ['a', 'b', 'c', 'd'] });
    });

    it('preserves empty repeated values without mutating the input', () => {
      const params = new URLSearchParams('q=&q=b&q=');
      const before = params.toString();

      expect(parseEntries(params)).to.deep.equal({ q: ['', 'b', ''] });
      expect(params.toString()).to.equal(before);
      expect(params.getAll('q')).to.deep.equal(['', 'b', '']);
    });

    it('uses decoded names and values from URLSearchParams', () => {
      expect(
        parseEntries(
          new URLSearchParams('encoded%20name=a%2Bb&encoded%20name=c+d')
        )
      ).to.deep.equal({ 'encoded name': ['a+b', 'c d'] });
    });

    it('parses normalized Headers values', () => {
      const headers = new Headers();
      headers.append('x-value', 'a');
      headers.append('x-value', 'b');

      expect(parseEntries(headers)).to.deep.equal({ 'x-value': 'a, b' });
    });

    it('preserves repeated FormData strings and Files', () => {
      const file = new File(['contents'], 'example.txt');
      const form = new FormData();
      form.append('value', 'first');
      form.append('value', file);
      form.append('value', 'last');

      const parsed = parseEntries(form);
      const values = parsed['value'];
      expect(values).to.be.an('array');
      if (!Array.isArray(values)) {
        throw new TypeError('Expected repeated values to be an array.');
      }
      expect(values).to.have.length(3);
      expect(values[0]).to.equal('first');
      expect(values[1]).to.equal(file);
      expect(values[2]).to.equal('last');
    });

    it('treats prototype-related names as ordinary own properties', () => {
      const parsed = parseEntries(
        new URLSearchParams(
          '__proto__=first&__proto__=second&constructor=ctor&toString=string'
        )
      );

      expect(Object.getPrototypeOf(parsed)).to.equal(Object.prototype);
      expect(Object.keys(parsed)).to.deep.equal([
        '__proto__',
        'constructor',
        'toString'
      ]);
      expect(Object.prototype.hasOwnProperty.call(parsed, '__proto__')).to.be
        .true;
      expect(Object.prototype.hasOwnProperty.call(parsed, 'constructor')).to.be
        .true;
      expect(Object.prototype.hasOwnProperty.call(parsed, 'toString')).to.be
        .true;
      expect(parsed).to.deep.equal(
        Object.fromEntries([
          ['__proto__', ['first', 'second']],
          ['constructor', 'ctor'],
          ['toString', 'string']
        ])
      );
    });
  });

  it('rejects repeated values for a scalar query schema', async () => {
    const result = await validateSearch('q=a&q=b', {
      type: 'object',
      properties: { q: { type: 'string' } }
    });

    expect(result.invoked).to.be.false;
    expect(result.error).to.be.instanceOf(HttpError);
    expect((result.error as HttpError).status).to.equal(400);
    expect((result.error as HttpError).body).to.include({
      part: 'search',
      message: 'Query string parameters are invalid.'
    });
  });

  it('rejects both duplicate orders for a scalar query schema', async () => {
    const schema: Schema = {
      type: 'object',
      properties: { q: { type: 'string', maxLength: 2 } }
    };

    for (const query of ['q=over-limit&q=ok', 'q=ok&q=over-limit']) {
      const result = await validateSearch(query, schema);
      expect(result.invoked, query).to.be.false;
      expect(result.error, query).to.be.instanceOf(HttpError);
      expect((result.error as HttpError).status, query).to.equal(400);
    }
  });

  it('accepts repeated values with an array-capable query schema', async () => {
    const result = await validateSearch('tag=a&tag=b', {
      type: 'object',
      properties: {
        tag: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } }
          ]
        }
      }
    });

    expect(result.error).to.be.undefined;
    expect(result.invoked).to.be.true;
    expect(result.context.req.url.searchParams.getAll('tag')).to.deep.equal([
      'a',
      'b'
    ]);
  });

  it('validates every value in a repeated query parameter', async () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        q: {
          type: 'array',
          items: { type: 'string', maxLength: 2 }
        }
      }
    };

    for (const query of ['q=over-limit&q=ok', 'q=ok&q=over-limit']) {
      const result = await validateSearch(query, schema);
      expect(result.invoked, query).to.be.false;
      expect(result.error, query).to.be.instanceOf(HttpError);
    }
  });

  it('preserves explicitly supplied custom parser behavior', async () => {
    const result = await validateSearch(
      'q=over-limit&q=ok',
      {
        type: 'object',
        properties: { q: { type: 'string', maxLength: 2 } }
      },
      Object.fromEntries
    );

    expect(result.error).to.be.undefined;
    expect(result.invoked).to.be.true;
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

  it('rejects both duplicate orders for a scalar form schema', async () => {
    const schema: Schema = {
      type: 'object',
      properties: { q: { type: 'string', maxLength: 2 } }
    };

    for (const values of [
      ['over-limit', 'ok'],
      ['ok', 'over-limit']
    ]) {
      const body = new URLSearchParams();
      for (const value of values) {
        body.append('q', value);
      }

      const result = await validateForm(body, schema);
      expect(result.invoked, values.join(',')).to.be.false;
      expect(result.error, values.join(',')).to.be.instanceOf(HttpError);
      expect((result.error as HttpError).body).to.include({
        part: 'body',
        message: 'Body is invalid.'
      });
    }
  });

  it('accepts repeated form fields with an array-capable schema', async () => {
    const body = new URLSearchParams();
    body.append('tag', 'a');
    body.append('tag', 'b');

    const result = await validateForm(body, {
      type: 'object',
      properties: {
        tag: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } }
          ]
        }
      }
    });

    expect(result.error).to.be.undefined;
    expect(result.invoked).to.be.true;
  });

  it('validates every repeated form field value', async () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        q: {
          type: 'array',
          items: { type: 'string', maxLength: 2 }
        }
      }
    };

    for (const values of [
      ['over-limit', 'ok'],
      ['ok', 'over-limit']
    ]) {
      const body = new URLSearchParams();
      for (const value of values) {
        body.append('q', value);
      }

      const result = await validateForm(body, schema);
      expect(result.invoked, values.join(',')).to.be.false;
      expect(result.error, values.join(',')).to.be.instanceOf(HttpError);
    }
  });

  it('preserves custom parser behavior for repeated form fields', async () => {
    const body = new URLSearchParams();
    body.append('q', 'first');
    body.append('q', 'last');

    const result = await validateForm(
      body,
      {
        type: 'object',
        properties: { q: { const: 'last' } }
      },
      Object.fromEntries
    );

    expect(result.error).to.be.undefined;
    expect(result.invoked).to.be.true;
  });

  it('accepts repeated multipart fields with an array schema', async () => {
    const body = new FormData();
    body.append('tag', 'a');
    body.append('tag', 'b');

    const result = await validateForm(body, {
      type: 'object',
      properties: {
        tag: { type: 'array', items: { type: 'string' } }
      }
    });

    expect(result.error).to.be.undefined;
    expect(result.invoked).to.be.true;
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
