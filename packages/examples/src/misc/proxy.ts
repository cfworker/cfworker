const requestHeaders = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Referer',
  'User-Agent'
];

const responseHeaders = [
  'Content-Type',
  'Cache-Control',
  'Expires',
  'Accept-Ranges',
  'Date',
  'Last-Modified',
  'ETag'
];

/**
 * Generate a new request based on the original. Filter the request
 * headers to prevent leaking user data (cookies, etc) and filter
 * the response headers to prevent the origin setting policy on
 * our origin.
 *
 * @param url The URL to proxy
 * @param request The original request (to copy parameters from)
 */
export async function proxyRequest(url: string, request: Request) {
  const init = {
    method: request.method,
    headers: {} as Record<string, string>
  };
  for (const name of requestHeaders) {
    const value = request.headers.get(name);
    if (value) {
      init.headers[name] = value;
    }
  }
  const clientAddr = request.headers.get('cf-connecting-ip');
  if (clientAddr) {
    init.headers['X-Forwarded-For'] = clientAddr;
  }
  const response = await fetch(url, init);
  const responseInit = {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ['X-Content-Type-Options']: 'nosniff'
    } as Record<string, string>
  };
  for (const name of responseHeaders) {
    const value = response.headers.get(name);
    if (value) {
      responseInit.headers[name] = value;
    }
  }
  return new Response(response.body, responseInit);
}
