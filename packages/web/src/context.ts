import { Cookies } from './cookies';
import { Req } from './req';
import { ResponseBuilder } from './response-builder';

export class Context {
  public readonly req: Req;
  public readonly res: ResponseBuilder;
  public readonly cookies: Cookies;
  public readonly respondWith!: (response: Response) => void;
  public readonly responded: Promise<Response>;
  public readonly state: any;

  constructor(private readonly event: FetchEvent) {
    const request = event.request;
    this.req = new Req(request);
    this.res = new ResponseBuilder();
    this.cookies = new Cookies(request.headers, this.res.headers);
    this.responded = new Promise<Response>(resolve => {
      // @ts-ignore
      this.respondWith = resolve;
    });
    this.state = {};
  }

  public waitUntil(promise: Promise<any>) {
    this.event.waitUntil(promise);
  }
}
