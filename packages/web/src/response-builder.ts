import statuses from 'statuses';

export type ExtendedBodyInit =
  | BodyInit
  | boolean
  | Date
  | number
  | object
  | null;

export class ResponseBuilder {
  public readonly headers = new Headers();
  private _status = 404;
  private _explicitStatus = false;
  private _implicitType = false;
  private _body: ExtendedBodyInit = null;
  private _stringifyBody = false;

  get status() {
    return this._status;
  }
  set status(value) {
    this._explicitStatus = true;
    this._status = value;
    if (this.body && statuses.empty[value]) {
      this.body = null;
    }
  }

  get statusText() {
    return statuses[this._status]!;
  }

  get body() {
    return this._body;
  }
  set body(value: ExtendedBodyInit | null) {
    this._body = value;

    // no content
    if (value === null) {
      if (!statuses.empty[this.status]) {
        this._status = 204;
      }
      this.headers.delete('content-type');
      this.headers.delete('content-length');
      this.headers.delete('transfer-encoding');
      return;
    }

    // set the status
    if (!this._explicitStatus) {
      this._status = 200;
    }

    // set Content-Type
    if (
      // Response will automatically use Blob's type.
      value instanceof Blob ||
      // Response will automatically use multipart/form-data.
      value instanceof FormData ||
      // Response will automatically use application/x-www-form-urlencoded.
      value instanceof URLSearchParams ||
      // Cannot determine Content-Type.
      ArrayBuffer.isView(value) ||
      value instanceof ArrayBuffer ||
      value instanceof ReadableStream
    ) {
      this._stringifyBody = false;
      if (this._implicitType) {
        this._implicitType = false;
        this.headers.delete('content-type');
      }
    } else if (typeof value === 'string') {
      this._stringifyBody = false;
      if (!this.headers.has('content-type') || this._implicitType) {
        this._implicitType = true;
        if (/^\s*</.test(value)) {
          this.headers.set('content-type', 'text/html;charset=UTF-8');
        } else {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        }
      }
    } else {
      this._stringifyBody = true;
      this._implicitType = true;
      this.headers.set('content-type', 'application/json;charset=UTF-8');
    }
  }

  redirect(url: string | URL) {
    if (url instanceof URL) {
      url = url.href;
    }

    this.headers.set('location', url);

    if (!statuses.redirect[this.status]) {
      this.status = 302;
    }

    this.type = 'text/plain;charset=UTF-8';
    this.body = `Redirecting to ${url}.`;
  }

  get type() {
    const type = this.headers.get('content-type');
    if (!type) {
      return '';
    }
    return type.split(';', 1)[0];
  }
  set type(value) {
    this._implicitType = false;
    if (value) {
      this.headers.set('content-type', value);
    } else {
      this.headers.delete('content-type');
    }
  }

  get lastModified() {
    const date = this.headers.get('last-modified');
    return date ? new Date(date) : null;
  }
  set lastModified(value: string | Date | null) {
    if (value === null) {
      this.headers.delete('last-modified');
      return;
    }
    if (typeof value === 'string') {
      value = new Date(value);
    }
    this.headers.set('last-modified', value.toUTCString());
  }

  get etag() {
    return this.headers.get('etag');
  }
  set etag(value) {
    if (value) {
      if (!/^(W\/)?"/.test(value)) {
        value = `"${value}"`;
      }
      this.headers.set('etag', value);
    } else {
      this.headers.delete('etag');
    }
  }

  create() {
    const { body: rawBody, status, statusText, headers } = this;
    const body = this._stringifyBody
      ? JSON.stringify(rawBody)
      : (rawBody as BodyInit);
    return new Response(body, { status, statusText, headers });
  }
}

// Cloudflare workers do not define the Blob class.
const Blob = self.Blob || ((class {} as any) as Blob);
