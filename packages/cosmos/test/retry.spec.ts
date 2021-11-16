import { expect } from 'chai';
import { describe, it } from 'mocha';
import { CosmosClient } from '../src/index.js';
import { DefaultRetryPolicy, RetryContext } from '../src/retry.js';

describe('retry', () => {
  const url = 'https://cfworker.documents.azure.com/dbs/abc/colls/xyz';

  describe('DefaultRetryPolicy', () => {
    const policy = new DefaultRetryPolicy();

    it('should retry when status is 429', async () => {
      const context: RetryContext = {
        request: new Request(url),
        response: new Response(undefined, {
          status: 429,
          headers: { 'x-ms-retry-after-ms': '2000' }
        }),
        attempts: 1,
        cumulativeWaitMs: 0
      };

      const instruction = await policy.shouldRetry(context);

      expect(instruction.retry).to.equal(true);
      expect(instruction.delayMs).to.equal(2000);
    });

    it('should retry when read session is unavailable', async () => {
      const context: RetryContext = {
        request: new Request(url),
        response: new Response(undefined, {
          status: 404,
          headers: { 'x-ms-substatus': '1002' }
        }),
        attempts: 1,
        cumulativeWaitMs: 0
      };

      const instruction = await policy.shouldRetry(context);

      expect(instruction.retry).to.equal(true);
      expect(instruction.delayMs).to.equal(0);
    });

    it('should use default retry delay when x-ms-retry-after-ms header is missing', async () => {
      const context: RetryContext = {
        request: new Request(url),
        response: mockResponse(url, undefined, { status: 429 }),
        attempts: 1,
        cumulativeWaitMs: 0
      };

      const instruction = await policy.shouldRetry(context);

      expect(instruction.retry).to.equal(true);
      expect(instruction.delayMs).to.equal(policy.defaultRetryDelayMs);
    });

    it('should not retry when response status is ok', async () => {
      const context: RetryContext = {
        request: new Request(url),
        response: mockResponse(url, undefined, { status: 200 }),
        attempts: 1,
        cumulativeWaitMs: 0
      };

      const instruction = await policy.shouldRetry(context);

      expect(instruction.retry).to.equal(false);
    });

    it('should not retry when attempts equals or exceeds max', async () => {
      const context: RetryContext = {
        request: new Request(url),
        response: mockResponse(url, undefined, { status: 429 }),
        attempts: policy.maxAttempts,
        cumulativeWaitMs: 0
      };

      const instruction = await policy.shouldRetry(context);

      expect(instruction.retry).to.equal(false);
    });

    it('should not retry when cumulative wait equals or exceeds max', async () => {
      const context: RetryContext = {
        request: new Request(url),
        response: mockResponse(url, undefined, { status: 429 }),
        attempts: 1,
        cumulativeWaitMs: policy.maxCumulativeWaitTimeMs
      };

      const instruction = await policy.shouldRetry(context);

      expect(instruction.retry).to.equal(false);
    });
  });

  describe('CosmosClient', () => {
    const clientFactory = (...responses: Response[]) =>
      new CosmosClient({
        endpoint: 'https://foo.com',
        masterKey:
          'Zg7ec6ojajv9FBjZmeGeqeDCJEhg8nSdWMIA3JCu9c2saIawh8ixHTPLPP52fO7h7C7xcS3iknEabtRhai+zHw==',
        dbId: 'foo',
        collId: 'bar',
        // @ts-ignore
        fetch: () => Promise.resolve(responses.shift())
      });

    it('uses retry policy', async () => {
      const doc = { id: 'my-id' };
      const client = clientFactory(
        mockResponse(url, undefined, {
          status: 429,
          headers: { 'x-ms-retry-after-ms': '20', 'x-ms-request-charge': '1' }
        }),
        mockResponse(url, undefined, {
          status: 429,
          headers: { 'x-ms-retry-after-ms': '30', 'x-ms-request-charge': '2' }
        }),
        mockResponse(url, JSON.stringify(doc), {
          status: 200,
          headers: { 'x-ms-request-charge': '3' }
        })
      );

      const response = await client.getDocument({
        docId: doc.id,
        partitionKey: 'my-partition'
      });
      expect(response.status).to.equal(200);
      expect(response.requestCharge).to.equal(3);
      expect(client.requestCharges).to.equal(6);
      expect(client.retries).to.eql({ count: 2, delayMs: 50 });
      const responseDoc = await response.json();
      expect(responseDoc).to.eql(doc);
    });

    it('stops retrying', async () => {
      const doc = { id: 'my-id' };
      const retryResponse = mockResponse(url, undefined, {
        status: 429,
        headers: { 'x-ms-retry-after-ms': '20', 'x-ms-request-charge': '1' }
      });
      const client = clientFactory(
        retryResponse,
        retryResponse,
        retryResponse,
        retryResponse,
        retryResponse,
        retryResponse,
        retryResponse,
        retryResponse,
        retryResponse,
        retryResponse,
        mockResponse(url, JSON.stringify(doc), {
          status: 200,
          headers: { 'x-ms-request-charge': '3' }
        })
      );

      const response = await client.getDocument({
        docId: doc.id,
        partitionKey: 'my-partition'
      });
      expect(response.status).to.equal(429);
      expect(response.requestCharge).to.equal(1);
      expect(client.requestCharges).to.equal(10);
      expect(client.retries).to.eql({ count: 9, delayMs: 180 });
    });
  });
});

function mockResponse(url: string, bodyInit?: BodyInit, init?: ResponseInit) {
  const response = new Response(bodyInit, init);
  Object.defineProperty(response, 'url', { value: url });
  return response;
}
