import { HttpError } from './HttpError';

export class RangeNotSatisfiableError extends HttpError {
  constructor(message: string) {
    super(416, message);
  }
}
