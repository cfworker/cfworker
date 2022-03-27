import { CosmosClient } from '@cfworker/cosmos';

const endpoint = process.env.COSMOS_DB_ORIGIN;
const masterKey = process.env.COSMOS_DB_MASTER_KEY;
const dbId = process.env.COSMOS_DB_DATABASE;
const collId = 'integration-test';
const partitionKey = 'test';

const client = new CosmosClient({ endpoint, masterKey, dbId, collId });

addEventListener('fetch', async event => {
  const url = new URL(event.request.url);
  const docId = url.searchParams.get('id') ?? 'demo';

  await ensureCollection();

  if (event.request.method === 'GET') {
    const res = await client.getDocument({ docId, partitionKey });
    event.respondWith(new Response(res.body, { status: res.status }));
  } else if (event.request.method === 'POST') {
    const document: any = await event.request.json();
    document.id = docId;
    document._partitionKey = partitionKey;
    const res = await client.createDocument({ document, partitionKey });
    event.respondWith(new Response(res.body, { status: res.status }));
  } else if (event.request.method === 'PUT') {
    const document: any = await event.request.json();
    document.id = docId;
    document._partitionKey = partitionKey;
    const res = await client.replaceDocument({
      docId,
      document,
      partitionKey
    });
    event.respondWith(new Response(res.body, { status: res.status }));
  } else {
    event.respondWith(new Response(null, { status: 404 }));
  }
});

let collectionCreated = false;

function ensureCollection() {
  if (collectionCreated) {
    return Promise.resolve();
  }
  collectionCreated = true;
  return client.createCollection({
    partitionKey: {
      paths: ['/_partitionKey'],
      kind: 'Hash'
    }
  });
}
