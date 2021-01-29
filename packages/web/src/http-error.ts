import statuses from 'statuses';

export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: string | object;

  constructor(status: number, body: string | object) {
    const statusText = statuses[statuses(status)]!;

    super(statusText);

    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }

    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }

  public toResponse(): Response {
    let body = this.body || this.statusText;
    let contentType: string;
    if (typeof body === 'string') {
      contentType = 'text/plain';
    } else {
      contentType = 'application/json';
      body = JSON.stringify(body);
    }
    const { status, statusText } = this;
    const headers = { 'content-type': contentType };
    return new Response(body, { status, statusText, headers });
  }
}
