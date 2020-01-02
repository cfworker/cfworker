import { HttpError } from './HttpError';

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}
