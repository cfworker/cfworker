import { expect } from 'chai';
import { Req, ReqBody } from '../src/req.js';

describe('Req', () => {
  const factory = () => {
    const request = new Request('https://foo.com/hello-world', {
      method: 'POST',
      body: JSON.stringify({ foo: 'bar' })
    });
    request.headers.set('accept', 'text/html');
    request.headers.set('cookie', 'ping=pong;beep=boop;');
    return new Req(request);
  };

  it('parses request url', () => {
    const req = factory();
    expect(req.url.origin).to.equal('https://foo.com');
  });

  it('exposes accepts', () => {
    const req = factory();
    expect(req.accepts.type('text/html')).to.equal('text/html');
    expect(req.accepts.type('application/json')).to.equal(false);
  });

  it('exposes body', async () => {
    const req = factory();
    const data = await req.body.json();
    expect(data).to.eql({ foo: 'bar' });
  });
});

describe('ReqBody', () => {
  it('reads ArrayBuffer', async () => {
    const arr = new Int16Array([1, 2, 3]);
    const request = new Request('https://a.b', { method: 'POST', body: arr });
    const rb = new ReqBody(request);
    const data = await rb.arrayBuffer();
    const arr2 = new Int16Array(data);
    expect(arr2).to.eql(arr);
    const data2 = await rb.arrayBuffer();
    expect(data2).to.equal(data);
  });

  it('reads FormData', async () => {
    const body = new FormData();
    body.append('foo', 'bar');
    const request = new Request('https://a.b', { method: 'POST', body });
    const rb = new ReqBody(request);
    const data = await rb.formData();
    expect(data.get('foo')).to.eql('bar');
    const data2 = await rb.formData();
    expect(data2).to.equal(data);
  });

  it('reads JSON', async () => {
    const obj = { foo: 'bar' };
    const request = new Request('https://a.b', {
      method: 'POST',
      body: JSON.stringify(obj)
    });
    const rb = new ReqBody(request);
    const obj2 = await rb.json();
    expect(obj2.foo).to.eql('bar');
    const obj3 = await rb.json();
    expect(obj3).to.equal(obj2);
  });

  it('reads text', async () => {
    const body = 'hello world';
    const request = new Request('https://a.b', {
      method: 'POST',
      body
    });
    const rb = new ReqBody(request);
    const body2 = await rb.text();
    expect(body2).to.eql(body);
    const body3 = await rb.text();
    expect(body3).to.equal(body2);
  });
});
