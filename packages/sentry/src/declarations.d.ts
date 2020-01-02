interface Headers {
  [Symbol.iterator]: () => Iterator<[string, string]>;
}

interface ErrorConstructor {
  captureStackTrace(thisArg: any, func: any): void;
}
