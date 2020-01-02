import { HttpError } from './HttpError';

export class LoopDetectedError extends HttpError {
  constructor(message: string) {
    super(508, message);
  }
}
