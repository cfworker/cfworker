import { Cookies } from './cookies.js';
import { Req } from './req.js';
import { ResponseBuilder } from './response-builder.js';

export class Context {
  public readonly req: Req;
  public readonly res: ResponseBuilder;
  public readonly cookies: Cookies;
  public readonly state: any;

  constructor(
    request: Request,
    public readonly environmentBindings: any,
    private readonly _context: {
      waitUntil(promise: Promise<any>): void;
    }
  ) {
    this.req = new Req(request);
    this.res = new ResponseBuilder();
    this.cookies = new Cookies(request.headers, this.res.headers);
    this.state = {};
  }

  public waitUntil(promise: Promise<any>): void {
    this._context.waitUntil(promise);
  }
}
