/** @type {(event: any) => void} */
const defaultFetchHandler = event => {
  const message = 'No fetch handler attached.';
  event.respondWith(
    new Response(message, { status: 503, statusText: 'Service Unavailable' })
  );
};

/** @type {EventListener} */
export let fetchHandler = defaultFetchHandler;

/**
 * @param {string} event
 * @param {EventListener} handler
 */
export function addEventListener(event, handler) {
  if (event === 'fetch') {
    fetchHandler = handler;
  }
}

/**
 * @param {Event} event
 */
export function dispatchEvent(event) {
  if (event.type === 'fetch') {
    fetchHandler(event);
  }
}

export function resetFetchHandler() {
  fetchHandler = defaultFetchHandler;
}
