import { HttpError } from './HttpError';

export class MethodNotAllowedError extends HttpError {
  constructor(message: string) {
    super(405, message);
  }
}
