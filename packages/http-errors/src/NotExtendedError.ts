import { HttpError } from './HttpError';

export class NotExtendedError extends HttpError {
  constructor(message: string) {
    super(510, message);
  }
}
