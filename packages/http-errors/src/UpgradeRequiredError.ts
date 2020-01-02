import { HttpError } from './HttpError';

export class UpgradeRequiredError extends HttpError {
  constructor(message: string) {
    super(426, message);
  }
}
