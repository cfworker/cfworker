# @cfworker/cosmos

Azure Cosmos DB client for Cloudflare Workers and web.
Tiny package, [minimal dependencies](/packages/cosmos/package.json), streaming optimized.

- [Getting started](#getting-started)
  - [Specify consistency level](#specify-consistency-level)
  - [Default database or collection](#default-database-or-collection)
  - [Authenticating with resource tokens](#authenticating-with-resource-tokens)
- [Databases](#databases)
  - [get databases](#get-databases)
  - [get database](#get-database)
- [Collections](#collections)
  - [get collections](#get-collections)
  - [get collection](#get-collection)
  - [create collection](#create-collection)
  - [replace collection](#replace-collection)
  - [delete collection](#delete-collection)
- [Documents](#documents)
  - [get documents](#get-documents)
  - [get document](#get-document)
  - [create document](#create-document)
  - [upsert document](#upsert-document)
  - [replace document](#replace-document)
  - [delete document](#delete-document)
- [Queries](#queries)
  - [basic query](#basic-query)
  - [query with parameters](#query-with-parameters)
  - [cross-partition query](#cross-partition-query)
  - [populate query metrics](#populate-query-metrics)
- [Streaming with FetchEvent](#streaming-with-fetchevent)
- [Contributing](#contributing)

## Getting started

```ts
import { CosmosClient } from '@cfworker/cosmos';

// 🚨️ Do not commit your Cosmos DB master key to source control!
// Use a bundler like Rollup, Parcel, or Webpack to interpolate your master key at build-time.
const masterKey = '...top secret master key copied from the azure portal...';
const endpoint = 'https://xxxxxxxxxxxx.documents.azure.com';

const client = new CosmosClient({ endpoint, masterKey });
```

### Specify consistency level

By default the CosmosClient uses the "Session" consistency level.
You may override the default value when constructing the CosmosClient.

```ts
const consistencyLevel = 'Eventual';

const client = new CosmosClient({ endpoint, masterKey, consistencyLevel });
```

Most methods on CosmosClient accept a `consistencyLevel` argument to enable overriding the client's consistency level on a case-by-case basis.

```ts
const res = client.getDocuments({ consistencyLevel: 'Bounded' });
```

### Default database or collection

Most methods on CosmosClient require dbId and collId arguments.
You may specify default values for these arguments when constructing the CosmosClient.

```ts
const dbId = 'my-db';
const collId = 'my-coll';

const client = new CosmosClient({ endpoint, masterKey, dbId, collId });
```

### Authenticating with resource tokens

Your Cosmos DB master key should never be sent to the browser.
Use resource tokens, which are scoped and time limited when accessing Cosmos DB from the front-end.

_not-implemented, coming soon..._

## Databases

### Get databases

```ts
const res = await client.getDatabases();
const dbs = await res.json();
```

With max-items / continuation:

```ts
let res = await client.getDatabases({ maxItems: 10 });
console.log(await res.json()); // print first 10 dbs
while (res.hasNext) {
  res = await res.next();
  console.log(await res.json()); // print next page of dbs until res.hasNext is false.
}
```

### Get database

```ts
const res = client.getDatabase({ dbId: 'my-db' });
const db = res.json();
```

If you [specified dbId when instantiating the CosmosClient](#default-database-or-collection), then the dbId argument isn't required:

```ts
const res = client.getDatabase();
const db = res.json();
```

## Collections

### Get collections

```ts
const res = await client.getCollections({ dbId: 'my-db' });
const colls = await res.json();
```

### Get collection

```ts
const res = await client.getCollection({
  dbId: 'my-db',
  collId: 'my-coll'
});
const coll = await res.json();
```

If you [specified dbId when instantiating the CosmosClient](#default-database-or-collection), then the dbId argument isn't required:

```ts
const res = await client.getCollection({ collId: 'my-coll' });
const coll = await res.json();
```

If you [specified both dbId and collId when instantiating the CosmosClient](#default-database-or-collection), then the dbId and collId arguments are not required:

```ts
const res = await client.getCollection();
const coll = await res.json();
```

### Create collection

```ts
const dbId = 'my-db';
const collId = 'my-coll';
const partitionKey: PartitionKeyDefinition = {
  paths: ['/_partitionKey'],
  kind: 'Hash'
};
const res = await client.createCollection({ dbId, collId, partitionKey });
if (res.status === 201) {
  // created!
} else if (res.status === 409) {
  // conflict! collection already exists.
}
```

### Replace collection

```ts
const dbId = 'my-db';
const collId = 'my-coll';
const partitionKey: PartitionKeyDefinition = {
  paths: ['/_partitionKey'],
  kind: 'Hash'
};

// create collection
const res = await client.createCollection({ dbId, collId, partitionKey });
const etag = res.etag;

// disable indexing
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
```

### Delete collection

```ts
const res = await client.deleteCollection({ dbId, collId });
```

## Documents

### Get documents

```ts
interface Person {
  id: string;
  name: string;
  age: number;
}

let res = await client.getDocuments<Person>({ maxItems: 100 });
console.log(await res.json()); // print first 100 results
while (res.hasNext) {
  res = await res.next();
  console.log(await res.json()); // continue printing results until hasNext is false
}
```

### Get document

```ts
const res = await client.getDocument<Person>({ docId: 'xyz' });
```

### Create document

```ts
const document: MessageDoc = {
  id: docId,
  message: 'a',
  _partitionKey: 'test' // container is configured with partition key "/_partitionKey"
};
const res = await client.createDocument({
  document,
  partitionKey: 'test'
});

const etag = res.etag; // capture etag value for use with updates
```

### Upsert document

```ts
const res = await client.createDocument<MessageDoc>({
  document,
  partitionKey: 'test',
  isUpsert: true
});
```

### Replace document

```ts
const res = await client.replaceDocument<MessageDoc>({
  docId,
  document,
  partitionKey: 'test',
  ifMatch: etag // optimistic concurrency
});
```

### Delete document

```ts
const res = await client.deleteDocument({ docId });
```

## Queries

### Basic query

```ts
const query = `SELECT * FROM ROOT`;
const res = await client.queryDocuments<Person>({ query });
const results = await res.json();
```

### Query with parameters

```ts
const query = `SELECT * FROM ROOT x WHERE x.id = @id`;
const parameters: QueryParameter[] = [{ name: '@id', value: 'xyz' }];
const res = await client.queryDocuments({ query, parameters });
const results = await res.json();
```

### Cross-partition query

```ts
const query = `SELECT * FROM ROOT`;
const res = await client.queryDocuments({ query, enableCrossPartition: true });
const results = await res.json();
```

### Populate query metrics

```ts
const query = `SELECT * FROM ROOT`;
const res = await client.queryDocuments({ query, populateMetrics: true });
const metrics = res.headers.get('x-ms-documentdb-query-metrics');
```

### Streaming with FetchEvent

[Example Cloudflare Worker](/packages/cosmos/examples/worker.ts)

To run this example:

```
git clone https://github.com/cfworker/cfworker
cd cfworker
yarn install
yarn workspace @cfworker/cosmos cfworker run examples/worker.ts --watch
```

## Contributing

1. Clone and install deps.

   ```
   git clone https://github.com/cfworker/cfworker
   yarn install
   ```

2. Open with VSCode

   ```
   code cfworker
   ```

3. Optional: to run tests locally, go to the [Azure portal](https://portal.azure.com),
   create a Cosmos DB account for integration testing. Then create a `.env` file in `packages/cosmos` file with following values
   ```
   COSMOS_DB_ORIGIN=https://xxxxxxxxxxx.documents.azure.com
   COSMOS_DB_MASTER_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   COSMOS_DB_DATABASE=xxxxxxxxx
   ```
