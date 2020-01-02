import { HttpError } from './HttpError';

export class ProxyAuthenticationRequiredError extends HttpError {
  constructor(message: string) {
    super(407, message);
  }
}
