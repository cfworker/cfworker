declare var process: {
  env: { [name: string]: string };
};

// interface Headers {
//   [Symbol.iterator]: () => Iterator<[string, string]>
// }

// interface FetchEvent extends Event {
//   passThroughOnException(): void;
//   respondWith(response: Promise<Response> | Response): Promise<Response>;
//   waitUntil(promise: Promise<any>): void;
// }

// declare function addEventListener(type: 'fetch', listener: (this: ServiceWorkerGlobalScope, ev: FetchEvent) => any, options?: boolean | AddEventListenerOptions): void;

// interface JsonWebKey { // extend existing JsonWebKey interface
//   x5c?: string[];
//   kid?: string;
//   x5t?: string;
// }
