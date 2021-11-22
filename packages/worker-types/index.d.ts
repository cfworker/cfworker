interface ErrorConstructor {
  captureStackTrace(thisArg: any, func: any): void;
}

interface JsonWebKey {
  x5c?: string[];
  kid?: string;
  x5t?: string;
  n?: string;
}

type BufferSource = ArrayBufferView | ArrayBuffer;

declare function setTimeout(
  handler: Function,
  timeout?: number,
  ...arguments: any[]
): number;
