import { HttpError } from './HttpError';

export class NetworkAuthenticationRequiredError extends HttpError {
  constructor(message: string) {
    super(511, message);
  }
}
