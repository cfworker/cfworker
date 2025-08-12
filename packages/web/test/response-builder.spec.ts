import { expect } from 'chai';
import { ResponseBuilder } from '../src/response-builder.js';

describe('ResponseBuilder', () => {
  it('sets status text from status code', () => {
    const res = new ResponseBuilder();
    res.status = 404;
    expect(res.statusText).to.equal('Not Found');
    res.status = 401;
    expect(res.statusText).to.equal('Unauthorized');
    res.status = 200;
    expect(res.statusText).to.equal('OK');
  });

  it('clears body when empty status is set', () => {
    const res = new ResponseBuilder();
    res.body = 'test';
    res.status = 204;
    expect(res.body).to.equal(null);
    expect(res.type).to.equal('');
  });

  it('sets status when body is assigned', () => {
    const res = new ResponseBuilder();
    res.body = 'test';
    expect(res.status).to.equal(200);
    res.body = null;
    expect(res.status).to.equal(204);
  });

  it('sets content-type to json when object body is assigned', async () => {
    const res = new ResponseBuilder();
    res.body = { hello: 'world' };
    expect(res.type).to.equal('application/json');
    const response = res.create();
    const data = await response.json();
    expect(data).to.eql({ hello: 'world' });
  });

  it('sets content-type to json when array body is assigned', async () => {
    const res = new ResponseBuilder();
    res.body = [3, 2, 1];
    expect(res.type).to.equal('application/json');
    const response = res.create();
    const data = await response.json();
    expect(data).to.eql([3, 2, 1]);
  });

  it('sets content-type to json when number body is assigned', async () => {
    const res = new ResponseBuilder();
    res.body = 3;
    expect(res.type).to.equal('application/json');
    const response = res.create();
    const data = await response.json();
    expect(data).to.equal(3);
  });

  it('sets content-type to json when Date body is assigned', async () => {
    const res = new ResponseBuilder();
    res.body = new Date('2020-05-24T12:05:44.722Z');
    expect(res.type).to.equal('application/json');
    const response = res.create();
    const data = await response.json();
    expect(data).to.equal('2020-05-24T12:05:44.722Z');
  });

  it('sets content-type to text when string body is assigned', async () => {
    const res = new ResponseBuilder();
    res.body = 'hello world';
    expect(res.type).to.equal('text/plain');
    const response = res.create();
    const data = await response.text();
    expect(data).to.equal('hello world');
  });

  it('sets content-type to html when string body starting with "<" is assigned', async () => {
    const res = new ResponseBuilder();
    res.body = '  <html';
    expect(res.type).to.equal('text/html');
    const response = res.create();
    const data = await response.text();
    expect(data).to.equal('  <html');
  });

  it('sets content-type to form-data when FormData body is assigned', () => {
    const res = new ResponseBuilder();
    res.body = new FormData();
    expect(res.type).to.equal('');
    const response = res.create();
    const type = response.headers.get('content-type');
    expect(type && type.startsWith('multipart/form-data')).to.be.true;
  });

  it('sets content-type to form-urlencoded when URLSearchParams body is assigned', () => {
    const res = new ResponseBuilder();
    res.body = new URLSearchParams();
    expect(res.type).to.equal('');
    const response = res.create();
    const type = response.headers.get('content-type');
    expect(type && type.startsWith('application/x-www-form-urlencoded')).to.be
      .true;
  });

  it('does not set content-type when ArrayBuffer body is assigned', () => {
    const res = new ResponseBuilder();
    res.body = new ArrayBuffer(3);
    expect(res.type).to.equal('');
  });

  it('does not set content-type when typed array body is assigned', () => {
    const res = new ResponseBuilder();
    res.body = new Uint8Array([1, 2, 3]);
    expect(res.type).to.equal('');
  });

  it('does not set content-type when ReadableStream body is assigned', () => {
    const res = new ResponseBuilder();
    const { readable } = new TransformStream<Uint8Array>();
    res.body = readable;
    expect(res.type).to.equal('');
  });

  it('preserves explicitly assigned content-type via headers', () => {
    const res = new ResponseBuilder();
    res.headers.set('content-type', 'text/svg+xml');
    res.body = 'hello world';
    expect(res.type).to.equal('text/svg+xml');
  });

  it('preserves explicitly assigned content-type via type property', () => {
    const res = new ResponseBuilder();
    res.type = 'text/svg+xml';
    res.body = 'hello world';
    expect(res.type).to.equal('text/svg+xml');
  });

  it('overrides explicitly assigned content-type when body must be stringified', () => {
    const res = new ResponseBuilder();
    res.type = 'text/svg+xml';
    res.body = {};
    expect(res.type).to.equal('application/json');
  });

  it('builds response', async () => {
    const res = new ResponseBuilder();
    res.body = 'hello world';
    res.status = 200;
    res.type = 'text/plain';
    const response = res.create();
    expect(response.status).to.equal(200);
    expect(await response.text()).to.equal('hello world');
    expect(response.headers.get('content-type')).to.equal('text/plain');
  });
});
