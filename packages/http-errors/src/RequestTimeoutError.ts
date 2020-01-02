import { HttpError } from './HttpError';

export class RequestTimeoutError extends HttpError {
  constructor(message: string) {
    super(408, message);
  }
}
