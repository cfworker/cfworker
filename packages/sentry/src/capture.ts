import { serializeError } from './tracekit.js';

const sentryClient = 'cfworker-sentry';

/**
 * Report an error to Sentry
 */
export function captureError(
  sentryDsn: string,
  environment: string,
  release: string,
  err: any,
  request: Request,
  user: any
) {
  const event_id = crypto.randomUUID();
  const timestamp = new Date().toISOString().substr(0, 19);
  if (!(err instanceof Error)) {
    err = Object.prototype.valueOf.call(err ?? {});
    Error.captureStackTrace(err, captureError);
  }
  const parsed = serializeError(err);
  const body = {
    event_id,
    timestamp,
    sdk: {
      name: sentryClient,
      version: '1.0.0'
    },
    level: 'error',
    transaction: request.url,
    server_name: 'cloudflare',
    release,
    // tags: {},
    environment,
    // modules: {},
    extra: {
      toString: err.toString(),
      stack: err.stack
    },
    exception: {
      values: [
        {
          type: parsed.name,
          value: parsed.message,
          stacktrace: {
            frames: parsed.stack.reverse().map(s => ({
              filename: s.url,
              function: s.func,
              lineno: s.line,
              colno: s.column
            }))
          }
        }
      ]
    },
    request: serializeRequest(request),
    user: Object.assign(user || {}, {
      ip_address: request.headers.get('CF-Connecting-IP')
    })
  };
  const { origin, pathname: project, username: key } = new URL(sentryDsn);
  const api = `${origin}/api${project}/store/?sentry_key=${key}&sentry_version=7&sentry_client=${sentryClient}`;
  const posted = fetch(api, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return { event_id, posted };
}

function serializeHeaders(headers: Headers) {
  const map: Record<string, string> = {};
  for (const [key, value] of headers) {
    if (key === 'cookie') {
      continue;
    }
    map[key] = value;
  }
  return map;
}

function serializeRequest(request: Request) {
  return {
    url: request.url,
    method: request.method,
    headers: serializeHeaders(request.headers)
  };
}
