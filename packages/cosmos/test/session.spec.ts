import { expect } from 'chai';
import {
  DefaultSessionContainer,
  getCollectionId,
  readSessionNotAvailable
} from '../src/index.js';

describe('session', () => {
  describe('readSessionNotAvailable', () => {
    it('returns true when status is 404 and substatus is 1002', async () => {
      const response = new Response(undefined, {
        status: 404,
        headers: { 'x-ms-substatus': '1002' }
      });
      expect(readSessionNotAvailable(response)).to.equal(true);
    });

    it('returns true when status is not 404 or substatus is not 1002', async () => {
      let response = new Response(undefined, {
        status: 403,
        headers: { 'x-ms-substatus': '1002' }
      });
      expect(readSessionNotAvailable(response)).to.equal(false);
      response = new Response(undefined, {
        status: 404,
        headers: { 'x-ms-substatus': '1001' }
      });
      expect(readSessionNotAvailable(response)).to.equal(false);
    });
  });

  describe('getCollectionId', () => {
    it('Gets ids from request url', () => {
      expect(
        getCollectionId(
          new Request('https://cfworker.documents.azure.com/dbs/abc/colls/xyz')
        )
      ).to.eql({ dbId: 'abc', collId: 'xyz' });
    });

    it('Returns null when the url is not a collection url', () => {
      expect(
        getCollectionId(
          new Request('https://cfworker.documents.azure.com/dbs/abc/users/xyz')
        )
      ).to.equal(null);
    });

    it('Gets ids from response header', () => {
      const response = mockResponse(
        'https://cfworker.documents.azure.com/dbs/abc/colls'
      );
      response.headers.set('x-ms-alt-content-path', 'dbs/abc/colls/xyz');
      expect(
        getCollectionId(
          new Request('https://cfworker.documents.azure.com/dbs/abc/colls/xyz')
        )
      ).to.eql({ dbId: 'abc', collId: 'xyz' });
    });
  });

  describe('DefaultSessionContainer', () => {
    it('Does not set session token when session container is empty', () => {
      const sessions = new DefaultSessionContainer();
      const request = new Request(
        'https://cfworker.documents.azure.com/dbs/abc/colls/xyz',
        { headers: { 'x-ms-consistency-level': 'Session' } }
      );
      sessions.setRequestSession(request);
      expect(request.headers.has('x-ms-session-token')).to.be.false;
    });

    it('Sets session token', () => {
      const sessions = new DefaultSessionContainer();
      let response = mockResponse(
        'https://cfworker.documents.azure.com/dbs/db1/colls/coll1'
      );
      response.headers.set('x-ms-session-token', 'session 1');
      sessions.readResponseSession(response);

      response = mockResponse(
        'https://cfworker.documents.azure.com/dbs/db2/colls/coll2'
      );
      response.headers.set('x-ms-session-token', 'session 2');
      sessions.readResponseSession(response);

      let request = new Request(
        'https://cfworker.documents.azure.com/dbs/db1/colls/coll1/docs/x',
        { headers: { 'x-ms-consistency-level': 'Session' } }
      );
      sessions.setRequestSession(request);
      expect(request.headers.get('x-ms-session-token')).to.equal('session 1');

      request = new Request(
        'https://cfworker.documents.azure.com/dbs/db2/colls/coll2/docs/x',
        { headers: { 'x-ms-consistency-level': 'Session' } }
      );
      sessions.setRequestSession(request);
      expect(request.headers.get('x-ms-session-token')).to.equal('session 2');
    });

    it('Clears session token when read session is unavailable', () => {
      const sessions = new DefaultSessionContainer();
      let response = mockResponse(
        'https://cfworker.documents.azure.com/dbs/db1/colls/coll1'
      );
      response.headers.set('x-ms-session-token', 'session 1');
      sessions.readResponseSession(response);

      let request = new Request(
        'https://cfworker.documents.azure.com/dbs/db1/colls/coll1/docs/x',
        { headers: { 'x-ms-consistency-level': 'Session' } }
      );
      sessions.setRequestSession(request);
      expect(request.headers.get('x-ms-session-token')).to.equal('session 1');

      response = mockResponse(
        'https://cfworker.documents.azure.com/dbs/db1/colls/coll1',
        undefined,
        { status: 404 }
      );
      response.headers.set('x-ms-substatus', '1002');
      sessions.readResponseSession(response);

      request = new Request(
        'https://cfworker.documents.azure.com/dbs/db1/colls/coll1/docs/x',
        { headers: { 'x-ms-consistency-level': 'Session' } }
      );
      sessions.setRequestSession(request);
      expect(request.headers.has('x-ms-session-token')).to.be.false;
    });
  });
});

function mockResponse(url: string, bodyInit?: BodyInit, init?: ResponseInit) {
  const response = new Response(bodyInit, init);
  Object.defineProperty(response, 'url', { value: url });
  return response;
}
