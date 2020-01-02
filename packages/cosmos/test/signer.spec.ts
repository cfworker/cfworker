import { expect } from 'chai';
import { describe, it } from 'mocha';
import { getSigner } from '../src/index';

describe('Signer', () => {
  const masterKey =
    'Zg7ec6ojajv9FBjZmeGeqeDCJEhg8nSdWMIA3JCu9c2saIawh8ixHTPLPP52fO7h7C7xcS3iknEabtRhai+zHw==';
  const dateUtcString = 'Fri, 06 Dec 2019 07:29:46 GMT';
  const date = new Date(dateUtcString);
  const signer = getSigner(masterKey);

  describe('getPayload', () => {
    it('gets payload for /dbs request', () => {
      const request = new Request('/dbs');
      const expected = new Uint8Array([
        103,
        101,
        116,
        10,
        100,
        98,
        115,
        10,
        10,
        102,
        114,
        105,
        44,
        32,
        48,
        54,
        32,
        100,
        101,
        99,
        32,
        50,
        48,
        49,
        57,
        32,
        48,
        55,
        58,
        50,
        57,
        58,
        52,
        54,
        32,
        103,
        109,
        116,
        10,
        10
      ]);
      expect(signer.getPayload(request, date)).to.eql(expected);
    });

    it('gets payload for document request', () => {
      const request = new Request(
        '/dbs/mydatabase/colls/mycollection/docs/xyz'
      );
      const expected = new Uint8Array([
        103,
        101,
        116,
        10,
        100,
        111,
        99,
        115,
        10,
        100,
        98,
        115,
        47,
        109,
        121,
        100,
        97,
        116,
        97,
        98,
        97,
        115,
        101,
        47,
        99,
        111,
        108,
        108,
        115,
        47,
        109,
        121,
        99,
        111,
        108,
        108,
        101,
        99,
        116,
        105,
        111,
        110,
        47,
        100,
        111,
        99,
        115,
        47,
        120,
        121,
        122,
        10,
        102,
        114,
        105,
        44,
        32,
        48,
        54,
        32,
        100,
        101,
        99,
        32,
        50,
        48,
        49,
        57,
        32,
        48,
        55,
        58,
        50,
        57,
        58,
        52,
        54,
        32,
        103,
        109,
        116,
        10,
        10
      ]);
      expect(signer.getPayload(request, date)).to.eql(expected);
    });
  });

  describe('pathnameToResource', () => {
    it('parses /dbs', () => {
      expect(signer.pathnameToResource('/dbs')).to.eql({
        resourceType: 'dbs',
        resourceId: ''
      });
    });

    it('parses /dbs/{db-id}', () => {
      expect(signer.pathnameToResource('/dbs/mydatabase')).to.eql({
        resourceType: 'dbs',
        resourceId: 'dbs/mydatabase'
      });
    });

    it('parses /dbs/{db-id}/colls', () => {
      expect(signer.pathnameToResource('/dbs/mydatabase/colls')).to.eql({
        resourceType: 'colls',
        resourceId: 'dbs/mydatabase'
      });
    });

    it('parses /dbs/{db-id}/colls/{coll-id}', () => {
      expect(
        signer.pathnameToResource('/dbs/mydatabase/colls/mycollection')
      ).to.eql({
        resourceType: 'colls',
        resourceId: 'dbs/mydatabase/colls/mycollection'
      });
    });

    it('parses /dbs/{db-id}/colls/{coll-id}/docs', () => {
      expect(
        signer.pathnameToResource('/dbs/mydatabase/colls/mycollection/docs')
      ).to.eql({
        resourceType: 'docs',
        resourceId: 'dbs/mydatabase/colls/mycollection'
      });
    });

    it('parses /dbs/{db-id}/colls/{coll-id}/docs/{id}', () => {
      expect(
        signer.pathnameToResource('/dbs/mydatabase/colls/mycollection/docs/xyz')
      ).to.eql({
        resourceType: 'docs',
        resourceId: 'dbs/mydatabase/colls/mycollection/docs/xyz'
      });
    });
  });

  describe('sign', () => {
    it('signs /dbs request', async () => {
      const request = new Request('/dbs');
      await signer.sign(request, date);
      expect(request.headers.get('x-ms-date')).to.equal(dateUtcString);
      expect(request.headers.get('authorization')).to.equal(
        'type%3Dmaster%26ver%3D1.0%26sig%3D%2B9YmSiFN2VX5ECdDZJpRfZCQOsLOCemogc5kkT4hdb0%3D'
      );
    });

    it('signs /dbs/{db-id}/colls/{coll-id} request', async () => {
      const request = new Request('/dbs/mydatabase/colls/mycollection');
      await signer.sign(request, date);
      expect(request.headers.get('x-ms-date')).to.equal(dateUtcString);
      expect(request.headers.get('authorization')).to.equal(
        'type%3Dmaster%26ver%3D1.0%26sig%3DSydJ%2BHZtwOFbjqhSNyDHHh2eMX6%2BTPxCS%2BECMfzRnms%3D'
      );
    });

    it('signs /dbs/{db-id}/colls/{coll-id}/docs/{doc-id} request', async () => {
      const request = new Request(
        '/dbs/mydatabase/colls/mycollection/docs/xyz'
      );
      await signer.sign(request, date);
      expect(request.headers.get('x-ms-date')).to.equal(dateUtcString);
      expect(request.headers.get('authorization')).to.equal(
        'type%3Dmaster%26ver%3D1.0%26sig%3DAAmqs%2B1kLtNZxoa%2FGjHLwsMMQxuQQ8zm3M8v9TB4MhE%3D'
      );
    });
  });
});
