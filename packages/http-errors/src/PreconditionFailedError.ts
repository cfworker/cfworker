import { HttpError } from './HttpError';

export class PreconditionFailedError extends HttpError {
  constructor(message: string) {
    super(412, message);
  }
}
