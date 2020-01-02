export interface TraceKitError {
  name: string;
  message: string;
  stack: TraceKitStack[];
}

export interface TraceKitStack {
  url: string | null;
  func: string;
  args: string[];
  line: number | null;
  column: number | null;
}

/**
 * Serialize an error in TraceKit format.
 * Modified from https://github.com/csnover/TraceKit/blob/master/tracekit.js
 */
export function serializeError(error: any): TraceKitError {
  const chrome = /^\s*at (.*?) ?\((.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
  const chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
  const lines = error.stack.split('\n');
  const stack: TraceKitStack[] = [];
  for (const line of lines) {
    let parts: RegExpExecArray | null;
    if ((parts = chrome.exec(line))) {
      const isNative = parts[2] && parts[2].startsWith('native'); // start of line
      const isEval = parts[2] && parts[2].startsWith('eval'); // start of line
      let submatch: RegExpExecArray | null;
      if (isEval && (submatch = chromeEval.exec(parts[2]))) {
        // throw out eval line/column and use top-most line/column number
        parts[2] = submatch[1]; // url
        parts[3] = submatch[2]; // line
        parts[4] = submatch[3]; // column
      }
      stack.push({
        url: !isNative ? parts[2] : null,
        func: parts[1] || '?',
        args: isNative ? [parts[2]] : [],
        line: parts[3] ? +parts[3] : null,
        column: parts[4] ? +parts[4] : null
      });
    } else {
      continue;
    }
  }

  return {
    name: error.name || 'Unknown Error',
    message: error.message || '',
    stack
  };
}
