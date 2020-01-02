import { HttpError } from './HttpError';

export class PaymentRequiredError extends HttpError {
  constructor(message: string) {
    super(402, message);
  }
}
