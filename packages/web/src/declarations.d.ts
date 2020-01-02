declare function addEventListener(
  type: 'fetch',
  listener: (this: ServiceWorkerGlobalScope, ev: FetchEvent) => any,
  options?: boolean | AddEventListenerOptions
): void;
