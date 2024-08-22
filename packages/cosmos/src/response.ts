import { PersistedResource } from './types.js';

export abstract class CosmosResponse {
  constructor(protected readonly response: Response) {}

  get status(): number {
    return this.response.status;
  }
  get headers(): Headers {
    return this.response.headers;
  }
  get body(): ReadableStream<Uint8Array> | null {
    return this.response.body;
  }
  get activityId(): string | null {
    return this.response.headers.get('x-ms-activity-id');
  }
  get etag(): string {
    return this.response.headers.get('etag')!;
  }
  get requestCharge(): number {
    return parseInt(this.response.headers.get('x-ms-request-charge')!);
  }
  get raw(): Response {
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

  get count(): number {
    return parseInt(this.response.headers.get('x-ms-item-count')!);
  }
  get hasNext(): boolean {
    return this.response.headers.has('x-ms-continuation');
  }

  async json(): Promise<T[]> {
    const data: any = await this.response.json();
    return data[this.itemsProperty];
  }
}
