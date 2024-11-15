const sentryClient = 'cfworker-sentry';

const UNKNOWN_FUNCTION = '?';
const FILENAME_MATCH = /^\s*[-]{4,}$/;
const FULL_MATCH =
  /at (?:async )?(?:(.+?)\s+\()?(?:(.+):(\d+):(\d+)?|([^)]+))\)?/;

function parseLine(line: string) {
  const lineMatch = line.match(FULL_MATCH);

  if (lineMatch) {
    let object: string | undefined;
    let method: string | undefined;
    let functionName: string | undefined;
    let typeName: string | undefined;
    let methodName: string | undefined;

    if (lineMatch[1]) {
      functionName = lineMatch[1];

      let methodStart = functionName.lastIndexOf('.');
      if (functionName[methodStart - 1] === '.') {
        methodStart--;
      }

      if (methodStart > 0) {
        object = functionName.slice(0, methodStart);
        method = functionName.slice(methodStart + 1);
        const objectEnd = object.indexOf('.Module');
        if (objectEnd > 0) {
          functionName = functionName.slice(objectEnd + 1);
          object = object.slice(0, objectEnd);
        }
      }
      typeName = undefined;
    }

    if (method) {
      typeName = object;
      methodName = method;
    }

    if (method === '<anonymous>') {
      methodName = undefined;
      functionName = undefined;
    }

    if (functionName === undefined) {
      methodName = methodName || UNKNOWN_FUNCTION;
      functionName = typeName ? `${typeName}.${methodName}` : methodName;
    }

    let filename = './' + lineMatch[2]?.split('/').pop();
    const isNative = lineMatch[5] === 'native';
    if (!filename && lineMatch[5] && !isNative) {
      filename = './' + lineMatch[5]?.split('/').pop();
    }

    return {
      filename,
      function: functionName,
      lineno: _parseIntOrUndefined(lineMatch[3]),
      colno: _parseIntOrUndefined(lineMatch[4]),
      in_app: true
    };
  }

  if (line.match(FILENAME_MATCH)) {
    return {
      filename: line
    };
  }

  return undefined;
}

function _parseIntOrUndefined(input: string | undefined): number | undefined {
  return parseInt(input || '', 10) || undefined;
}

/**
 * Report an error to Sentry
 */
export function captureError({
  sentryDsn,
  environment,
  release,
  err,
  request,
  user,
  level = 'error'
}: {
  sentryDsn: string;
  environment: string;
  release: string;
  err: unknown;
  request: Request;
  user: any;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}): { event_id: string; posted: Promise<Response> } {
  const event_id = crypto.randomUUID();
  const timestamp = new Date().toISOString().substr(0, 19);
  let error: Error;
  if (err instanceof Error) {
    error = err;
  } else {
    error = new Error(err as string);
    error.message = String(err);
  }
  const body = {
    event_id,
    timestamp,
    sdk: {
      name: sentryClient,
      version: '1.0.0'
    },
    level,
    transaction: request.url,
    server_name: 'cloudflare',
    release,
    // tags: {},
    environment,
    // modules: {},
    extra: {},
    exception: {
      values: [
        {
          type: error.name,
          value: error.message,
          // Ref: https://develop.sentry.dev/sdk/event-payloads/stacktrace
          stacktrace: {
            frames:
              error.stack
                ?.split('\n')
                .map(parseLine)
                .filter(Boolean)
                .reverse() ?? []
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
