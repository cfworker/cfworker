declare var process: {
  env: { [name: string]: string };
};

interface ErrorConstructor {
  captureStackTrace(thisArg: any, func: any): void;
}

// extend existing JsonWebKey interface
interface JsonWebKey {
  x5c?: string[];
  kid?: string;
  x5t?: string;
}

interface Headers {
  [Symbol.iterator]: () => IterableIterator<[string, string]>;
}

declare function addEventListener(
  type: 'fetch',
  listener: (this: ServiceWorkerGlobalScope, ev: FetchEvent) => any,
  options?: boolean | AddEventListenerOptions
): void;
