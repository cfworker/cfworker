interface ErrorConstructor {
  captureStackTrace(thisArg: any, func: any): void;
}

// extend existing JsonWebKey interface
interface JsonWebKey {
  x5c?: string[];
  kid?: string;
  x5t?: string;
}

declare function addEventListener(
  type: 'fetch',
  listener: (this: ServiceWorkerGlobalScope, ev: FetchEvent) => any,
  options?: boolean | AddEventListenerOptions
): void;

interface Headers {
  [Symbol.iterator](): IterableIterator<[string, string]>;
  /**
   * Returns an iterator allowing to go through all key/value pairs contained in this object.
   */
  entries(): IterableIterator<[string, string]>;
  /**
   * Returns an iterator allowing to go through all keys of the key/value pairs contained in this object.
   */
  keys(): IterableIterator<string>;
  /**
   * Returns an iterator allowing to go through all values of the key/value pairs contained in this object.
   */
  values(): IterableIterator<string>;
}

interface URLSearchParams {
  [Symbol.iterator](): IterableIterator<[string, string]>;
  /**
   * Returns an array of key, value pairs for every entry in the search params.
   */
  entries(): IterableIterator<[string, string]>;
  /**
   * Returns a list of keys in the search params.
   */
  keys(): IterableIterator<string>;
  /**
   * Returns a list of values in the search params.
   */
  values(): IterableIterator<string>;
}
