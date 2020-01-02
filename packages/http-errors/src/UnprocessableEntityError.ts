import { HttpError } from './HttpError';

export class UnprocessableEntityError extends HttpError {
  constructor(message: string) {
    super(422, message);
  }
}
