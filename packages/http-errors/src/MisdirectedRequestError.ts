import { HttpError } from './HttpError';

export class MisdirectedRequestError extends HttpError {
  constructor(message: string) {
    super(421, message);
  }
}
