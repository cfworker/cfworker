import { HttpError } from './HttpError';

export class HTTPVersionNotSupportedError extends HttpError {
  constructor(message: string) {
    super(505, message);
  }
}
