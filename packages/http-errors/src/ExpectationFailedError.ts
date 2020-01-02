import { HttpError } from './HttpError';

export class ExpectationFailedError extends HttpError {
  constructor(message: string) {
    super(417, message);
  }
}
