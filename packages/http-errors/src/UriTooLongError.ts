import { HttpError } from './HttpError';

export class URITooLongError extends HttpError {
  constructor(message: string) {
    super(414, message);
  }
}
