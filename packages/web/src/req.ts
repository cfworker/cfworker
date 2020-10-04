import { Reviver, safeParse } from 'secure-json-parse';
import { Accepts } from './accepts.js';

export class Req {
  public readonly raw: Request;
  public readonly method: string;
  public readonly url: URL;
  public readonly headers: Headers;
  public readonly params: Record<string, string>;
  public readonly accepts: Accepts;
  public readonly body: ReqBody;

  constructor(request: Request) {
    this.raw = request;
    this.method = request.method;
    this.url = new URL(request.url);
    this.url.pathname = decodeURIComponent(this.url.pathname);
    this.headers = request.headers;
    this.params = Object.create(null);
    this.accepts = new Accepts(request.headers);
    this.body = new ReqBody(request);
  }
}

export class ReqBody {
  private _arrayBuffer: Promise<ArrayBuffer> | undefined;
  private _formData: Promise<FormData> | undefined;
  private _json: Promise<any> | undefined;
  private _text: Promise<string> | undefined;

  constructor(private readonly request: Request) {}

  public arrayBuffer() {
    if (!this._arrayBuffer) {
      this._arrayBuffer = this.request.arrayBuffer();
    }
    return this._arrayBuffer;
  }

  public formData() {
    if (!this._formData) {
      this._formData = this.request.formData();
    }
    return this._formData;
  }

  public json(reviver?: Reviver) {
    if (!this._json) {
      this._json = this.text().then(text => safeParse(text, reviver));
    }
    return this._json;
  }

  public text() {
    if (!this._text) {
      this._text = this.request.text();
    }
    return this._text;
  }
}
