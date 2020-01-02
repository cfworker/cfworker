import { HttpError } from './HttpError';

export class PreconditionRequiredError extends HttpError {
  constructor(message: string) {
    super(428, message);
  }
}
