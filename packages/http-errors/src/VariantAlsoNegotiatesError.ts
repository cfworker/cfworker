import { HttpError } from './HttpError';

export class VariantAlsoNegotiatesError extends HttpError {
  constructor(message: string) {
    super(506, message);
  }
}
