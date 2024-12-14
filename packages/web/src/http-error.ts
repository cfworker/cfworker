import statuses from 'statuses';

export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: string | object | null;

  constructor(status: number, body: string | object | null = null) {
    const statusText = statuses.message[status]!;

    super(statusText);

    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }

    this.status = status;
    this.statusText = statusText;
    this.body = statuses.empty[this.status] ? null : (body ?? statusText);
  }

  public toResponse(): Response {
    let body = this.body;
    const headers: HeadersInit = {};
    if (body === null) {
    } else if (typeof body === 'string') {
      headers['content-type'] = 'text/plain';
    } else {
      headers['content-type'] = 'application/json';
      body = JSON.stringify(body);
    }
    const { status, statusText } = this;
    return new Response(body, { status, statusText, headers });
  }
}
