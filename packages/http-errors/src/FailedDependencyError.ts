import { HttpError } from './HttpError';

export class FailedDependencyError extends HttpError {
  constructor(message: string) {
    super(424, message);
  }
}
