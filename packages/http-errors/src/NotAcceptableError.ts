import { HttpError } from './HttpError';

export class NotAcceptableError extends HttpError {
  constructor(message: string) {
    super(406, message);
  }
}
