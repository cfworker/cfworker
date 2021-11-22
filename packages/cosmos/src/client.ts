import { FeedResponse, ItemResponse } from './response.js';
import { defaultRetryPolicy, RetryContext, RetryPolicy } from './retry.js';
import { DefaultSessionContainer, SessionContainer } from './session.js';
import { getSigner, Signer } from './signer.js';
import {
  Collection,
  ConsistencyLevel,
  Database,
  Document,
  IndexingDirective,
  IndexingPolicy,
  OfferType,
  PartitionKeyDefinition,
  Resource
} from './types.js';
import { assertArg, escapeNonASCII, uri } from './util.js';

export interface CosmosClientConfig {
  /**
   * Cosmos DB endpoint.
   * @example
   * "https://xxxxxxxxxx.documents.azure.com"
   */
  endpoint: string;

  /**
   * Cosmos DB master key.
   */
  masterKey: string;

  /**
   * The retry policy to use when requests are throttled.
   */
  retryPolicy?: RetryPolicy;

  /**
   * Default consistency level for requests. This can be overriden on individual requests.
   * @default "Session"
   */
  consistencyLevel?: ConsistencyLevel;

  /**
   * Default database id. This can be overriden on individual requests.
   */
  dbId?: string;

  /**
   * Default collection id. This can be overriden on individual requests.
   */
  collId?: string;

  /**
   * Reads, writes, and stores session tokens for requests made with ConsistencyLevel is "Session".
   */
  sessions?: SessionContainer;

  /**
   * System fetch function
   */
  fetch?: typeof fetch;
}

export class CosmosClient {
  private readonly endpoint: string;
  private readonly signer: Signer;
  private readonly retryPolicy: RetryPolicy;
  private readonly consistencyLevel: ConsistencyLevel;
  private readonly dbId: string | undefined;
  private readonly collId: string | undefined;
  private readonly systemFetch: typeof fetch;
  public readonly sessions: SessionContainer;
  public requestCharges = 0;
  public retries = { count: 0, delayMs: 0 };

  constructor(config: CosmosClientConfig) {
    this.endpoint = config.endpoint;
    this.signer = getSigner(config.masterKey);
    this.retryPolicy = config.retryPolicy ?? defaultRetryPolicy;
    this.consistencyLevel = config.consistencyLevel ?? 'Session';
    this.dbId = config.dbId;
    this.collId = config.collId;
    this.sessions = config.sessions ?? new DefaultSessionContainer();
    this.systemFetch = config.fetch ?? fetch.bind(self);
  }

  public async getDatabases(
    args: GetDatabasesArgs = {}
  ): Promise<FeedResponse<Database>> {
    const url = this.endpoint + `/dbs`;
    const request = new Request(url, { method: 'GET' });
    this.setHeaders(request.headers, args);
    const response = await this.fetchWithRetry(request);
    const next = this.getNext(response, args, this.getDatabases);
    return new FeedResponse<Database>(response, next, 'Databases');
  }

  public async getDatabase(args: GetDatabaseArgs = {}) {
    const { dbId = this.dbId, ...headers } = args;
    assertArg('dbId', dbId);
    const url = this.endpoint + uri`/dbs/${dbId}`;
    const request = new Request(url, { method: 'GET' });
    this.setHeaders(request.headers, headers);
    const response = await this.fetchWithRetry(request);
    return new ItemResponse<Database>(response);
  }

  public async getCollections(
    args: GetCollectionsArgs = {}
  ): Promise<FeedResponse<Collection>> {
    const { dbId = this.dbId, ...headers } = args;
    assertArg('dbId', dbId);
    const url = this.endpoint + uri`/dbs/${dbId}/colls`;
    const request = new Request(url, { method: 'GET' });
    this.setHeaders(request.headers, headers);
    const response = await this.fetchWithRetry(request);
    const next = this.getNext(response, args, this.getCollections);
    return new FeedResponse<Collection>(response, next, 'DocumentCollections');
  }

  public async getCollection(args: GetCollectionArgs = {}) {
    const { dbId = this.dbId, collId = this.collId, ...headers } = args;
    assertArg('dbId', dbId);
    assertArg('collId', collId);
    const url = this.endpoint + uri`/dbs/${dbId}/colls/${collId}`;
    const request = new Request(url, { method: 'GET' });
    this.setHeaders(request.headers, headers);
    const response = await this.fetchWithRetry(request);
    return new ItemResponse<Collection>(response);
  }

  public async createCollection(args: CreateCollectionArgs) {
    const {
      dbId = this.dbId,
      collId = this.collId,
      indexingPolicy,
      partitionKey,
      ...headers
    } = args;
    assertArg('dbId', dbId);
    assertArg('collId', collId);
    const url = this.endpoint + uri`/dbs/${dbId}/colls`;
    const body = JSON.stringify({ id: collId, indexingPolicy, partitionKey });
    const request = new Request(url, { method: 'POST', body });
    this.setHeaders(request.headers, headers);
    request.headers.set('content-type', 'application/json');
    const response = await this.fetchWithRetry(request);
    return new ItemResponse<Collection>(response);
  }

  public async replaceCollection(args: ReplaceCollectionArgs) {
    const {
      dbId = this.dbId,
      collId = this.collId,
      indexingPolicy,
      partitionKey,
      ...headers
    } = args;
    assertArg('dbId', dbId);
    assertArg('collId', collId);
    const url = this.endpoint + uri`/dbs/${dbId}/colls/${collId}`;
    const body = JSON.stringify({ id: collId, indexingPolicy, partitionKey });
    const request = new Request(url, { method: 'PUT', body });
    this.setHeaders(request.headers, headers);
    request.headers.set('content-type', 'application/json');
    const response = await this.fetchWithRetry(request);
    return new ItemResponse<Collection>(response);
  }

  public async deleteCollection(args: DeleteCollectionArgs = {}) {
    const { dbId = this.dbId, collId = this.collId, ...headers } = args;
    assertArg('dbId', dbId);
    assertArg('collId', collId);
    const url = this.endpoint + uri`/dbs/${dbId}/colls/${collId}`;
    const request = new Request(url, { method: 'DELETE' });
    this.setHeaders(request.headers, headers);
    const response = await this.fetchWithRetry(request);
    return response;
  }

  public async getDocuments<T extends Resource>(
    args: GetDocumentsArgs
  ): Promise<FeedResponse<T & Document>> {
    const { dbId = this.dbId, collId = this.collId, ...headers } = args;
    assertArg('dbId', dbId);
    assertArg('collId', collId);
    const url = this.endpoint + uri`/dbs/${dbId}/colls/${collId}/docs`;
    const request = new Request(url, { method: 'GET' });
    this.setHeaders(request.headers, headers);
    const response = await this.fetchWithRetry(request);
    const next = this.getNext<GetDocumentsArgs, T & Document>(
      response,
      args,
      this.getDocuments
    );
    return new FeedResponse<T & Document>(response, next, 'Documents');
  }

  public async getDocument<T extends Resource>(args: GetDocumentArgs) {
    const { dbId = this.dbId, collId = this.collId, docId, ...headers } = args;
    assertArg('dbId', dbId);
    assertArg('collId', collId);
    const url = this.endpoint + uri`/dbs/${dbId}/colls/${collId}/docs/${docId}`;
    const request = new Request(url, { method: 'GET' });
    this.setHeaders(request.headers, headers);
    const response = await this.fetchWithRetry(request);
    return new ItemResponse<T & Document>(response);
  }

  public async createDocument<T extends Resource>(args: CreateDocumentArgs) {
    const {
      dbId = this.dbId,
      collId = this.collId,
      document,
      ...headers
    } = args;
    assertArg('dbId', dbId);
    assertArg('collId', collId);
    const url = this.endpoint + uri`/dbs/${dbId}/colls/${collId}/docs`;
    const body = toBodyInit(document);
    const request = new Request(url, { method: 'POST', body });
    this.setHeaders(request.headers, headers);
    request.headers.set('content-type', 'application/json');
    const response = await this.fetchWithRetry(request);
    return new ItemResponse<T & Document>(response);
  }

  public async replaceDocument<T extends Resource>(args: ReplaceDocumentArgs) {
    const {
      dbId = this.dbId,
      collId = this.collId,
      docId,
      document,
      ...headers
    } = args;
    assertArg('dbId', dbId);
    assertArg('collId', collId);
    const url = this.endpoint + uri`/dbs/${dbId}/colls/${collId}/docs/${docId}`;
    const body = toBodyInit(document);
    const request = new Request(url, { method: 'PUT', body });
    this.setHeaders(request.headers, headers);
    request.headers.set('content-type', 'application/json');
    const response = await this.fetchWithRetry(request);
    return new ItemResponse<T & Document>(response);
  }

  public async deleteDocument(args: DeleteDocumentArgs) {
    const { dbId = this.dbId, collId = this.collId, docId, ...headers } = args;
    assertArg('dbId', dbId);
    assertArg('collId', collId);
    const url = this.endpoint + uri`/dbs/${dbId}/colls/${collId}/docs/${docId}`;
    const request = new Request(url, { method: 'DELETE' });
    this.setHeaders(request.headers, headers);
    const response = await this.fetchWithRetry(request);
    return response;
  }

  public async queryDocuments<T>(
    args: QueryDocumentsArgs
  ): Promise<FeedResponse<T>> {
    const {
      dbId = this.dbId,
      collId = this.collId,
      query,
      parameters = [],
      ...headerArgs
    } = args;

    assertArg('dbId', dbId);
    assertArg('collId', collId);

    const headers = Object.assign(
      {
        enableCrossPartition: false,
        enableScan: false,
        maxItems: -1,
        populateMetrics: false,
        isQuery: true
      },
      headerArgs
    );
    const url = this.endpoint + uri`/dbs/${dbId}/colls/${collId}/docs`;
    const body = JSON.stringify({ query, parameters });
    const request = new Request(url, { method: 'POST', body });
    this.setHeaders(request.headers, headers);
    request.headers.set('content-type', 'application/query+json');
    const response = await this.fetchWithRetry(request);
    const next = this.getNext<QueryDocumentsArgs, T>(
      response,
      args,
      this.queryDocuments
    );
    return new FeedResponse<T>(response, next, 'Documents');
  }

  private getNext<TArgs extends CommonGetListArgs, TResult>(
    response: Response,
    args: TArgs,
    fn: (args: TArgs) => Promise<FeedResponse<TResult>>
  ) {
    return () => {
      const continuation = response.headers.get('x-ms-continuation');
      if (!continuation) {
        throw new Error(`Response is not continuable.`);
      }
      return fn.call(this, Object.assign({}, args, { continuation }));
    };
  }

  private async fetchWithRetry(
    request: Request,
    context?: RetryContext
  ): Promise<Response> {
    const retryRequest = request.clone();

    const response = await this.fetch(request);

    context ??= { attempts: 0, cumulativeWaitMs: 0, request, response };
    context.attempts++;
    context.request = retryRequest;
    context.response = response;

    const { retry, delayMs } = await this.retryPolicy.shouldRetry(context);
    if (!retry) {
      return response;
    }
    if (delayMs !== 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      context.cumulativeWaitMs += delayMs;
      this.retries.delayMs += delayMs;
    }
    this.retries.count++;
    return this.fetchWithRetry(retryRequest, context);
  }

  private async fetch(request: Request): Promise<Response> {
    this.sessions.setRequestSession(request);
    await this.signer.sign(request);
    const response = await this.systemFetch(request);
    this.sessions.readResponseSession(response);
    const requestCharge = +(response.headers.get('x-ms-request-charge') || 0);
    this.requestCharges += requestCharge;
    return response;
  }

  private setHeaders(headers: Headers, args: AllHeaders) {
    headers.set('accept', 'application/json');
    headers.set('cache-control', 'no-cache');
    headers.set('x-ms-version', '2018-12-31');
    if (args.activityId) {
      headers.set('x-ms-activity-id', args.activityId);
    }
    const consistencyLevel = args.consistencyLevel || this.consistencyLevel;
    headers.set('x-ms-consistency-level', consistencyLevel);
    if (args.continuation) {
      headers.set('x-ms-continuation', args.continuation);
    }
    if (args.enableScan) {
      headers.set('x-ms-documentdb-query-enable-scan', 'true');
    }
    if (args.ifMatch) {
      headers.set('if-match', args.ifMatch);
    }
    if (args.ifModifiedSince) {
      headers.set('if-modified-since', args.ifModifiedSince.toUTCString());
    }
    if (args.ifNoneMatch) {
      headers.set('if-none-match', args.ifNoneMatch);
    }
    if (args.indexingDirective) {
      headers.set('x-ms-indexing-directive', args.indexingDirective);
    }
    if (args.isQuery) {
      headers.set('x-ms-documentdb-isquery', args.isQuery.toString());
    }
    if (args.isUpsert) {
      headers.set('x-ms-documentdb-is-upsert', args.isUpsert.toString());
    }
    if (args.maxItems) {
      headers.set('x-ms-max-item-count', args.maxItems.toString(10));
    }
    if (args.offerType) {
      headers.set('x-ms-offer-type', args.offerType);
    }
    if (args.offerThroughput) {
      headers.set('x-ms-offer-throughput', args.offerThroughput.toString());
    }
    if (args.populateMetrics) {
      headers.set('x-ms-documentdb-populatequerymetrics', 'true');
    }
    if (args.partitionKey) {
      headers.set(
        'x-ms-documentdb-partitionkey',
        escapeNonASCII(JSON.stringify([args.partitionKey]))
      );
      if (args.isQuery) {
        headers.set('x-ms-documentdb-query-enablecrosspartition', 'false');
      }
    } else if (args.enableCrossPartition !== undefined && args.isQuery) {
      headers.set(
        'x-ms-documentdb-query-enablecrosspartition',
        args.enableCrossPartition.toString()
      );
    }
  }
}

export type DocumentInit = BufferSource | ReadableStream | string | Resource;

function toBodyInit(obj: DocumentInit): BodyInit {
  if (
    (typeof obj === 'string' || DataView.prototype.isPrototypeOf(obj),
    ArrayBuffer.isView(obj) || obj instanceof ReadableStream)
  ) {
    return obj as any;
  }
  return JSON.stringify(obj);
}

interface CommonArgs {
  activityId?: string;
  consistencyLevel?: ConsistencyLevel;
}

interface CommonGetArgs extends CommonArgs {
  ifNoneMatch?: string;
  ifModifiedSince?: Date;
}

interface CommonGetListArgs extends CommonGetArgs {
  maxItems?: number;
  continuation?: string;
}

export type GetDatabasesArgs = CommonGetListArgs;

export interface GetDatabaseArgs extends CommonGetArgs {
  dbId?: string;
}

export interface GetCollectionsArgs extends CommonGetListArgs {
  dbId?: string;
}

export interface GetCollectionArgs extends CommonGetArgs {
  dbId?: string;
  collId?: string;
}

export interface CreateCollectionArgs extends CommonArgs {
  dbId?: string;
  collId?: string;
  indexingPolicy?: IndexingPolicy;
  partitionKey: PartitionKeyDefinition;
  offerThroughput?: number;
  offerType?: OfferType;
}

export interface ReplaceCollectionArgs extends CommonArgs {
  dbId?: string;
  collId?: string;
  indexingPolicy: IndexingPolicy;
  partitionKey: PartitionKeyDefinition;
  ifMatch?: string;
}

export interface DeleteCollectionArgs extends CommonArgs {
  dbId?: string;
  collId?: string;
  ifMatch?: string;
}

export interface GetDocumentsArgs extends CommonGetListArgs {
  dbId?: string;
  collId?: string;
  partitionKey?: string;
}

export interface GetDocumentArgs extends CommonGetArgs {
  dbId?: string;
  collId?: string;
  docId: string;
  partitionKey: string;
}

export interface QueryDocumentsArgs extends CommonGetListArgs {
  dbId?: string;
  collId?: string;
  query: string;
  parameters?: QueryParameter[];
  partitionKey?: string;
  enableCrossPartition?: boolean;
  populateMetrics?: boolean;
  enableScan?: boolean;
}

export interface QueryParameter {
  name: string;
  value: string | number | boolean | null | undefined;
}

export interface CreateDocumentArgs extends CommonArgs {
  dbId?: string;
  collId?: string;
  document: DocumentInit;
  partitionKey: string;
  isUpsert?: boolean;
  indexingDirective?: IndexingDirective;
}

export interface ReplaceDocumentArgs extends CommonArgs {
  dbId?: string;
  collId?: string;
  docId: string;
  document: DocumentInit;
  partitionKey: string;
  ifMatch?: string;
  indexingDirective?: IndexingDirective;
}

export interface DeleteDocumentArgs extends CommonArgs {
  dbId?: string;
  collId?: string;
  docId: string;
  partitionKey: string;
  ifMatch?: string;
}

interface AllHeaders {
  activityId?: string;
  consistencyLevel?: ConsistencyLevel;
  continuation?: string;
  enableCrossPartition?: boolean;
  enableScan?: boolean;
  ifMatch?: string;
  ifModifiedSince?: Date;
  ifNoneMatch?: string;
  indexingDirective?: IndexingDirective;
  isQuery?: boolean;
  isUpsert?: boolean;
  maxItems?: number;
  offerType?: OfferType;
  offerThroughput?: number;
  partitionKey?: string;
  populateMetrics?: boolean;
}
