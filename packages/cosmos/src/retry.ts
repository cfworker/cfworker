import { readSessionNotAvailable } from './session';

export interface RetryContext {
  request: Request;
  response: Response;
  attempts: number;
  cumulativeWaitMs: number;
}

export interface RetryInstruction {
  retry: boolean;
  delayMs: number;
}

export interface RetryPolicy {
  shouldRetry(context: RetryContext): Promise<RetryInstruction>;
}

export class DefaultRetryPolicy implements RetryPolicy {
  constructor(
    public readonly maxAttempts = 10,
    public readonly maxCumulativeWaitTimeMs = 30000,
    public readonly defaultRetryDelayMs = 5000
  ) {}

  async shouldRetry(context: RetryContext): Promise<RetryInstruction> {
    if (readSessionNotAvailable(context.response)) {
      return { retry: true, delayMs: 0 };
    }
    if (
      context.response.status !== 429 ||
      context.attempts >= this.maxAttempts ||
      context.cumulativeWaitMs >= this.maxCumulativeWaitTimeMs
    ) {
      return { retry: false, delayMs: 0 };
    }
    const delayMs = +(
      context.response.headers.get('x-ms-retry-after-ms') ||
      this.defaultRetryDelayMs
    );
    return { retry: true, delayMs };
  }
}

export const defaultRetryPolicy: RetryPolicy = new DefaultRetryPolicy();
