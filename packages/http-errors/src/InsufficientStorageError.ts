import { HttpError } from './HttpError';

export class InsufficientStorageError extends HttpError {
  constructor(message: string) {
    super(507, message);
  }
}
