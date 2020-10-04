import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Accepts } from '../src/index.js';

describe('Accept', () => {
  it('supports empty headers', () => {
    const accepts = new Accepts(new Headers());
    expect(accepts.charset('iso-8859-5')).to.equal(false);
    expect(accepts.encoding('gzip')).to.equal(false);
    expect(accepts.language('en-us')).to.equal(false);
    expect(accepts.type('text/html')).to.equal(false);
  });

  it('returns highest weight match', () => {
    const headers = new Headers();
    headers.set('accept-charset', 'iso-8859-5, unicode-1-1;q=0.8');
    headers.set('accept-encoding', 'gzip;q=1.0, identity; q=0.5, *;q=0');
    headers.set('accept-language', 'en-US,en;q=0.9');
    headers.set(
      'accept',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
    );

    const accepts = new Accepts(headers);

    expect(accepts.charset('unicode-1-1')).to.equal('unicode-1-1');
    expect(accepts.encoding('gzip')).to.equal('gzip');
    expect(accepts.language('en')).to.equal('en');
    expect(accepts.type('image/webp')).to.equal('image/webp');

    expect(accepts.charset('unicode-1-1', 'iso-8859-5')).to.equal('iso-8859-5');
    expect(accepts.encoding('deflate', 'gzip')).to.equal('gzip');
    expect(accepts.language('en', 'en-us')).to.equal('en-us');
    expect(accepts.type('image/apng', 'image/webp')).to.equal('image/webp');
  });
});
