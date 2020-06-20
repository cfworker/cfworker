import { PersistedResource } from './types';

export abstract class CosmosResponse {
  constructor(protected readonly response: Response) {}

  get status() {
    return this.response.status;
  }
  get headers() {
    return this.response.headers;
  }
  get body() {
    return this.response.body;
  }
  get activityId() {
    return this.response.headers.get('x-ms-activity-id');
  }
  get etag() {
    return this.response.headers.get('etag')!;
  }
  get requestCharge() {
    return parseInt(this.response.headers.get('x-ms-request-charge')!);
  }
  get raw() {
    return this.response;
  }
}

export class ItemResponse<T extends PersistedResource> extends CosmosResponse {
  constructor(response: Response) {
    super(response);
  }

  json(): Promise<T> {
    return this.response.json();
  }
}

export class FeedResponse<T> extends CosmosResponse {
  constructor(
    response: Response,
    public readonly next: () => Promise<FeedResponse<T>>,
    private readonly itemsProperty: string
  ) {
    super(response);
  }

  get count() {
    return parseInt(this.response.headers.get('x-ms-item-count')!);
  }
  get hasNext() {
    return this.response.headers.has('x-ms-continuation');
  }

  async json(): Promise<T[]> {
    const data = await this.response.json();
    return data[this.itemsProperty];
  }
}
