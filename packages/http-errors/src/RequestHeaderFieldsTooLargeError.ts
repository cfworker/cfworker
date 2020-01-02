import { HttpError } from './HttpError';

export class RequestHeaderFieldsTooLargeError extends HttpError {
  constructor(message: string) {
    super(431, message);
  }
}
