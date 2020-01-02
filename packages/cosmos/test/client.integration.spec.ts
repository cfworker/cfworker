import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  CosmosClient,
  IndexingPolicy,
  PartitionKeyDefinition,
  QueryParameter
} from '../src/index';

const endpoint = process.env.COSMOS_DB_ORIGIN;
const masterKey = process.env.COSMOS_DB_MASTER_KEY;
const dbId = process.env.COSMOS_DB_DATABASE;
const collId = 'integration-test';
const partitionKey: PartitionKeyDefinition = {
  paths: ['/_partitionKey'],
  kind: 'Hash'
};

describe('CosmosClient', () => {
  const client = new CosmosClient({ endpoint, masterKey, dbId, collId });

  it('sets activity id', async () => {
    const activityId = '1abdf87a-c213-418b-b7fc-65d1bcf88aa2';
    const res = await client.getDatabase({ dbId: '🤠🤠🤠', activityId });
    expect(res.activityId).to.equal(activityId);
  });

  describe('databases', () => {
    it(`"${dbId}" database  exists`, async () => {
      const res = await client.getDatabase();
      expect(res.status).to.equal(200);
      const db = await res.json();
      expect(db.id).to.equal(dbId);
    });

    it('getDatabase status is 404 when database does not exist', async () => {
      const res = await client.getDatabase({ dbId: 'this-db-does-not-exist' });
      expect(res.status).to.equal(404);
    });

    it('getDatabases returns an array', async () => {
      const res = await client.getDatabases();
      expect(res.status).to.equal(200);
      const dbs = await res.json();
      expect(dbs).to.be.instanceof(Array);
      expect(dbs.find(d => d.id === dbId)).not.to.be.undefined;
    });
  });

  describe('collections', () => {
    let etag: string;

    after(() => client.deleteCollection({ dbId, collId }));

    it('creates a collection', async () => {
      const res = await client.createCollection({ dbId, collId, partitionKey });
      etag = res.etag;
      expect(res.status).to.equal(201);
    });

    it('returns conflict status when attempting to create a collection that already exists', async () => {
      const res = await client.createCollection({ dbId, collId, partitionKey });
      expect(res.status).to.equal(409);
    });

    it('replaces a collection', async () => {
      const indexingPolicy: IndexingPolicy = {
        indexingMode: 'none',
        automatic: false
      };
      const res = await client.replaceCollection({
        dbId,
        collId,
        ifMatch: etag,
        indexingPolicy,
        partitionKey
      });
      expect(res.status).to.equal(200);
      const coll = res.json();
      expect((await coll).indexingPolicy.automatic).to.equal(false);
    });

    it('gets existing collection', async () => {
      const res = await client.getCollection({ dbId, collId });
      expect(res.status).to.equal(200);
      const coll = await res.json();
      expect(coll.id).to.equal(collId);
    });

    it('gets an array of collections', async () => {
      const res = await client.getCollections({ dbId });
      expect(res.status).to.equal(200);
      const colls = await res.json();
      expect(colls.find(coll => coll.id === collId)).not.to.be.undefined;
    });

    it('returns not-found status when attempting to get a collection with database that does not exist', async () => {
      const res = await client.getCollection({
        dbId: 'this-db-does-not-exist',
        collId
      });
      expect(res.status).to.equal(404);
    });

    it('returns not-found status when attempting to get a collection that does not exist', async () => {
      const res = await client.getCollection({
        dbId,
        collId: 'this-coll-does-not-exist'
      });
      expect(res.status).to.equal(404);
    });

    it('deletes a collection', async () => {
      const res = await client.deleteCollection({ dbId, collId });
      expect(res.status).to.equal(204);
    });

    it('returns not-found status when attempting to delete a collection that does not exist', async () => {
      const res = await client.deleteCollection({ dbId, collId });
      expect(res.status).to.equal(404);
    });
  });

  describe('documents', () => {
    interface MessageDoc {
      id: string;
      message: string;
      _partitionKey: 'test';
    }
    const docId = 'test-doc';
    let etag: string;

    before(() => client.createCollection({ partitionKey }));
    after(() => client.deleteCollection());

    it('creates a document', async () => {
      const document: MessageDoc = {
        id: docId,
        message: 'a',
        _partitionKey: 'test'
      };
      const res = await client.createDocument({
        document,
        partitionKey: 'test'
      });
      expect(res.status).to.equal(201);
      etag = res.etag;
      const doc = await res.json();
      expect(doc.id).to.equal(docId);
    });

    it('replaces a document', async () => {
      const document: MessageDoc = {
        id: docId,
        message: 'b',
        _partitionKey: 'test'
      };
      const res = await client.replaceDocument<MessageDoc>({
        docId,
        document,
        partitionKey: 'test',
        ifMatch: etag
      });
      expect(res.status).to.equal(200);
      etag = res.etag;
      const doc = await res.json();
      expect(doc.id).to.equal(docId);
      expect(doc.message).to.equal('b');
    });

    it('upserts a document', async () => {
      const document: MessageDoc = {
        id: docId,
        message: 'c',
        _partitionKey: 'test'
      };
      const res = await client.createDocument<MessageDoc>({
        document,
        partitionKey: 'test',
        isUpsert: true
      });
      expect(res.status).to.equal(200);
      etag = res.etag;
      const doc = await res.json();
      expect(doc.id).to.equal(docId);
      expect(doc.message).to.equal('c');
    });

    it('creates a document with Uint8Array', async () => {
      const docId = 'test-uint8array-doc';
      const encoder = new TextEncoder();
      const document = encoder.encode(
        JSON.stringify({
          id: docId,
          message: 'utf-8 encoded',
          _partitionKey: 'test'
        })
      );
      const res = await client.createDocument({
        document,
        partitionKey: 'test'
      });
      expect(res.status).to.equal(201);
      const doc = await res.json();
      expect(doc.id).to.equal(docId);
    });

    it('gets a document by id', async () => {
      const res = await client.getDocument({
        docId,
        partitionKey: 'test'
      });
      expect(res.status).to.equal(200);
    });

    it('returns not-modified status when getting document with if-none-match', async () => {
      const res = await client.getDocument({
        docId,
        partitionKey: 'test',
        ifNoneMatch: etag
      });
      expect(res.status).to.equal(304);
    });

    it('deletes a document by id', async () => {
      const res = await client.deleteDocument({
        docId,
        partitionKey: 'test',
        ifMatch: etag
      });
      expect(res.status).to.equal(204);
    });
  });

  describe('queries', () => {
    before(async () => {
      await client.createCollection({ partitionKey });
      const promises: Promise<any>[] = [];
      for (const partitionKey of ['partition-key-1', 'partition-key-2']) {
        for (let i = 0; i < 10; i++) {
          const document = {
            id: `id-${i}`,
            value: i,
            _partitionKey: partitionKey
          };
          promises.push(
            client.createDocument({
              document,
              partitionKey
            })
          );
        }
      }
      await Promise.all(promises);
    });

    after(() => client.deleteCollection());

    it('supports query with no parameters', async () => {
      const query = `SELECT * FROM ROOT`;
      const res = await client.queryDocuments({
        query,
        partitionKey: 'partition-key-1'
      });
      const results = await res.json();
      expect(res.status).to.equal(200);
      expect(results.length).to.equal(10);
    });

    it('supports query with parameters', async () => {
      const query = `SELECT * FROM ROOT x WHERE x.id = @id`;
      const parameters: QueryParameter[] = [{ name: '@id', value: 'id-3' }];
      const res = await client.queryDocuments({
        query,
        parameters,
        partitionKey: 'partition-key-2'
      });
      const results = await res.json();
      expect(res.status).to.equal(200);
      expect(results.length).to.equal(1);
    });

    it('supports cross-partition queries', async () => {
      const query = `SELECT * FROM ROOT x WHERE x.id = @id`;
      const parameters: QueryParameter[] = [{ name: '@id', value: 'id-3' }];
      const res = await client.queryDocuments({
        query,
        parameters,
        enableCrossPartition: true
      });
      const results = await res.json();
      expect(res.status).to.equal(200);
      expect(results.length).to.equal(2);
    });

    it('populates metrics', async () => {
      const query = `SELECT * FROM ROOT`;
      const res = await client.queryDocuments({
        query,
        partitionKey: 'partition-key-1',
        populateMetrics: true
      });
      expect(res.status).to.equal(200);
      expect(res.headers.has('x-ms-documentdb-query-metrics')).to.equal(true);
    });

    it('supports max items and continuation', async () => {
      const query = `SELECT * FROM ROOT x ORDER BY x.id`;
      let res = await client.queryDocuments<{ id: string }>({
        query,
        partitionKey: 'partition-key-1',
        maxItems: 2
      });
      expect(res.status).to.equal(200);
      expect(res.count).to.equal(2);
      const results = await res.json();

      while (res.hasNext) {
        res = await res.next();
        expect(res.status).to.equal(200);
        expect(res.count).to.equal(2);
        results.push(...(await res.json()));
      }

      expect(results.length).to.equal(10);
      for (let i = 0; i < 10; i++) {
        expect(results[i].id).to.equal(`id-${i}`);
      }
    });
  });
});
