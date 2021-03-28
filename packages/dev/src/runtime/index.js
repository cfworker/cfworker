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
 * @param {Record<string, string> | null} staticContentManifest Workers site manifest.
 * @param {import('../kv.js').KVNamespaceInit[]} kvNamespaces Workers KV namespaces.
 */
export async function executeWorkerScript(
  code,
  sourcePathname,
  globals = [],
  staticContentManifest,
  kvNamespaces
) {
  resetFetchHandler();
  const scope = new ServiceWorkerGlobalScope(
    globals,
    staticContentManifest,
    kvNamespaces
  );
  await scope.init();
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
 * @param {string | undefined} bodyUrl
 * @param {RequestInit} init
 */
export async function dispatchFetchEvent(url, bodyUrl, init) {
  if (bodyUrl) {
    const response = await fetch(bodyUrl);
    init.body = await response.arrayBuffer();
  }
  const request = new Request(url, init);
  // @ts-ignore
  request.body = init.body;
  bindCfProperty(request);
  const event = new FetchEvent(request);
  fetchHandler(event);
  const response = await event.__responded__;
  const blob = await response.blob();
  const body = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject('Error reading body.');
    reader.readAsBinaryString(blob);
  });
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
