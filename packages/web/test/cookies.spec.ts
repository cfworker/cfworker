import { expect } from 'chai';
import { Cookies } from '../src/cookies.js';

describe('Cookies', () => {
  const requestHeaders = new Headers();
  requestHeaders.set('cookie', 'ping=pong;beep=boop;');
  const responseHeaders = new Headers();
  const cookies = new Cookies(requestHeaders, responseHeaders);

  it('gets cookies', () => {
    expect(cookies.get('beep')).to.equal('boop');
    expect(cookies.get('adsaf')).to.equal(null);
  });

  it('sets cookies', () => {
    cookies.set('session', 'xyz');
    expect(responseHeaders.get('set-cookie')).to.equal('session=xyz');
    cookies.set('session2', 'abc');
    expect(responseHeaders.get('set-cookie')).to.equal(
      'session=xyz, session2=abc'
    );
  });
});
