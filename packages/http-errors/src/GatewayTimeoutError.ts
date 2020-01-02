import { HttpError } from './HttpError';

export class GatewayTimeoutError extends HttpError {
  constructor(message: string) {
    super(504, message);
  }
}
