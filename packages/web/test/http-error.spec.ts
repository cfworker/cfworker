import { expect } from 'chai';
import { HttpError } from '../src/http-error.js';

describe('HttpError', () => {
  it('Creates response', async () => {
    const response = new HttpError(404).toResponse();
    expect(response.status).to.equal(404);
    expect(response.statusText).to.equal('Not Found');
    expect(response.headers.get('content-type')).to.equal('text/plain');
    expect(await response.text()).to.equal('Not Found');
  });

  it('Supports custom text body', async () => {
    const response = new HttpError(404, 'Not here').toResponse();
    expect(response.status).to.equal(404);
    expect(response.statusText).to.equal('Not Found');
    expect(response.headers.get('content-type')).to.equal('text/plain');
    expect(await response.text()).to.equal('Not here');
  });

  it('Supports custom object body', async () => {
    const response = new HttpError(400, { error: 'Invalid' }).toResponse();
    expect(response.status).to.equal(400);
    expect(response.statusText).to.equal('Bad Request');
    expect(response.headers.get('content-type')).to.equal('application/json');
    expect(await response.json()).to.eql({ error: 'Invalid' });
  });

  it('Supports empty status codes', async () => {
    const response = new HttpError(204).toResponse();
    expect(response.status).to.equal(204);
    expect(response.statusText).to.equal('No Content');
    expect(response.headers.get('content-type')).to.equal(null);
  });

  it('Supports custom headers', async () => {
    const response = new HttpError(404, 'not found here', {
      'my-header': 'my value'
    }).toResponse();
    expect(response.status).to.equal(302);
    expect(response.headers.get('content-type')).to.equal('text/plain');
    expect(response.headers.get('my-header')).to.equal('my value');
  });

  it('Custom headers override content-type sniffing', async () => {
    const response = new HttpError(404, '<body></body>', {
      'Content-Type': 'text/html'
    }).toResponse();
    expect(response.status).to.equal(404);
    expect(response.headers.get('content-type')).to.equal('text/html');
  });
});
