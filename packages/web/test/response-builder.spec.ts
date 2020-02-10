import { expect } from 'chai';
import { describe, it } from 'mocha';
import { ResponseBuilder } from '../src/response-builder';

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
  });

  it('sets status when body is assigned', () => {
    const res = new ResponseBuilder();
    res.body = 'test';
    expect(res.status).to.equal(200);
    res.body = null;
    expect(res.status).to.equal(204);
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
