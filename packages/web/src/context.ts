import { Reviver, safeParse } from 'secure-json-parse';
import { Accepts } from './accepts';
import { Cookies } from './cookies';
import { ResponseBuilder } from './response-builder';

export class Context {
  public readonly req: Request;
  public readonly res: ResponseBuilder;
  public readonly url: URL;
  public readonly cookies: Cookies;
  public readonly accepts: Accepts;
  public readonly respondWith!: (response: Response) => void;
  public readonly responded: Promise<Response>;
  public readonly state: any;

  constructor(private readonly event: FetchEvent) {
    const req = (this.req = event.request);
    this.url = new URL(req.url);
    this.url.pathname = decodeURIComponent(this.url.pathname);
    this.res = new ResponseBuilder();
    this.cookies = new Cookies(req.headers, this.res.headers);
    this.accepts = new Accepts(req.headers);
    this.responded = new Promise<Response>(resolve => {
      // @ts-ignore
      this.respondWith = resolve;
    });
    this.state = {};
  }

  public waitUntil(promise: Promise<any>) {
    this.event.waitUntil(promise);
  }

  public async safeJson(reviver?: Reviver) {
    const json = await this.req.text();
    return safeParse(json, reviver);
  }
}
