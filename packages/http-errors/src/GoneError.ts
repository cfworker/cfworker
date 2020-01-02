import { HttpError } from './HttpError';

export class GoneError extends HttpError {
  constructor(message: string) {
    super(410, message);
  }
}
