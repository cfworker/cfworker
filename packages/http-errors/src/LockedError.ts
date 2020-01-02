import { HttpError } from './HttpError';

export class LockedError extends HttpError {
  constructor(message: string) {
    super(423, message);
  }
}
