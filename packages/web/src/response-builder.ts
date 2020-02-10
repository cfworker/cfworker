import statuses from 'statuses';

export class ResponseBuilder {
  public readonly headers = new Headers();
  private _status = 404;
  private _explicitStatus = false;
  private _body: BodyInit | null = null;

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
  set body(value: BodyInit | null) {
    this._body = value;

    // no content
    if (value === null) {
      if (!statuses.empty[this.status]) {
        this._status = 204;
      }
      this.headers.delete('Content-Type');
      this.headers.delete('Content-Length');
      this.headers.delete('Transfer-Encoding');
      return;
    }

    // set the status
    if (!this._explicitStatus) {
      this._status = 200;
    }

    // todo: consider setting content type & length.
    // if (value instanceof Blob) {
    //   this.headers.set('Content-Type', value.type);
    //   this.headers.set('Content-Length', value.size.toString());
    // } else if (DataView.)
  }

  redirect(url: string | URL) {
    if (url instanceof URL) {
      url = url.href;
    }

    this.headers.set('Location', url);

    if (!statuses.redirect[this.status]) {
      this.status = 302;
    }

    this.type = 'text/plain; charset=utf-8';
    this.body = `Redirecting to ${url}.`;
  }

  get type() {
    const type = this.headers.get('Content-Type');
    if (!type) return '';
    return type.split(';', 1)[0];
  }
  set type(value) {
    if (value) {
      this.headers.set('Content-Type', value);
    } else {
      this.headers.delete('Content-Type');
    }
  }

  get lastModified() {
    const date = this.headers.get('last-modified');
    return date ? new Date(date) : null;
  }
  set lastModified(value: string | Date | null) {
    if (value === null) {
      this.headers.delete('Last-Modified');
      return;
    }
    if (typeof value === 'string') {
      value = new Date(value);
    }
    this.headers.set('Last-Modified', value.toUTCString());
  }

  get etag() {
    return this.headers.get('ETag');
  }
  set etag(value) {
    if (value) {
      if (!/^(W\/)?"/.test(value)) {
        value = `"${value}"`;
      }
      this.headers.set('ETag', value);
    } else {
      this.headers.delete('ETag');
    }
  }

  create() {
    const { body, status, statusText, headers } = this;
    return new Response(body, { status, statusText, headers });
  }
}
