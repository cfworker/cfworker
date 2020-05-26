interface ErrorConstructor {
  captureStackTrace(thisArg: any, func: any): void;
}

interface JsonWebKey {
  x5c?: string[];
  kid?: string;
  x5t?: string;
}
