import { HttpError } from './HttpError';

export class PayloadTooLargeError extends HttpError {
  constructor(message: string) {
    super(413, message);
  }
}
