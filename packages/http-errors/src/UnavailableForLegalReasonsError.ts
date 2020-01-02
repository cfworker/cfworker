import { HttpError } from './HttpError';

export class UnavailableForLegalReasonsError extends HttpError {
  constructor(message: string) {
    super(451, message);
  }
}
