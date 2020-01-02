import { HttpError } from './HttpError';

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}
