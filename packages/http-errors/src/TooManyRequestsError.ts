import { HttpError } from './HttpError';

export class TooManyRequestsError extends HttpError {
  constructor(message: string) {
    super(429, message);
  }
}
