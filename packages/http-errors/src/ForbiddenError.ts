import { HttpError } from './HttpError';

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}
