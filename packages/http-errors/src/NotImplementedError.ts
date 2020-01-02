import { HttpError } from './HttpError';

export class NotImplementedError extends HttpError {
  constructor(message: string) {
    super(501, message);
  }
}
