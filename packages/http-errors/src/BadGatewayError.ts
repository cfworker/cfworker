import { HttpError } from './HttpError';

export class BadGatewayError extends HttpError {
  constructor(message: string) {
    super(502, message);
  }
}
