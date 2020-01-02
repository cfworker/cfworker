import { HttpError } from './HttpError';

export class LengthRequiredError extends HttpError {
  constructor(message: string) {
    super(411, message);
  }
}
