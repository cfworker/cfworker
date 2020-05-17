import statuses from 'statuses';

export class HttpError extends Error {
  public readonly statusText = statuses[statuses(this.status)]!;

  constructor(public readonly status: number, message: string) {
    super(message);
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
