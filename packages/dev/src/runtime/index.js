import { fetchHandler, resetFetchHandler } from './add-event-listener.js';
import { FetchEvent } from './fetch-event.js';
import { wrapHeaders } from './headers.js';
import { scopeGuard } from './scope-guard.js';
import { ServiceWorkerGlobalScope } from './service-worker-global-scope.js';

wrapHeaders(Headers);

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

/**
 * @param {string} code The worker script.
 * @param {string} sourcePathname Where to list the script in the chrome devtools sources tree.
 * @param {string[]} globals Names of additional globals to expose.
 */
export function executeWorkerScript(code, sourcePathname, globals = []) {
  resetFetchHandler();
  const scope = new ServiceWorkerGlobalScope(globals);
  const guardedScope = new Proxy(scope, scopeGuard);
  const sourceUrl = `//# sourceURL=${location.origin}${sourcePathname}`;
  const fn = new AsyncFunction(
    '__guardedScope__',
    `with(__guardedScope__) {\n${code}\n}\n${sourceUrl}`
  );
  fn(guardedScope);
}

/**
 * @param {string} url
 * @param {RequestInit} init
 */
export async function dispatchFetchEvent(url, init) {
  const request = new Request(url, init);
  // @ts-ignore
  request.body = init.body;
  bindCfProperty(request);
  const event = new FetchEvent(request);
  fetchHandler(event);
  const response = await event.__responded__;
  const body = await response.text();
  /** @type {Record<string, string>} */
  const headers = Object.create(null);
  response.headers.forEach((v, k) => (headers[k] = v));
  return {
    status: response.status,
    statusText: response.statusText,
    headers,
    body
  };
}

/**
 * @param {Request} request
 */
function bindCfProperty(request) {
  Object.defineProperty(request, 'cf', {
    value: {
      tlsVersion: 'TLSv1.2',
      tlsCipher: 'ECDHE-ECDSA-CHACHA20-POLY1305',
      country: 'US',
      colo: 'LAX'
    },
    writable: false,
    enumerable: false
  });
}
