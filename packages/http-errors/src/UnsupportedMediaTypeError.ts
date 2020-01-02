import { HttpError } from './HttpError';

export class UnsupportedMediaTypeError extends HttpError {
  constructor(message: string) {
    super(415, message);
  }
}
