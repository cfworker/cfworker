const quote = '"';
const quoteRegex = /"/g;
const delimiter = ',';
const rowDelimiter = '\r\n';
const requiresQuoteRegex = /["\r\n,]/;

export interface EncodeOptions<T> {
  /**
   * Properties to include
   */
  columns?: Column<T, keyof T>[];
}

export interface Column<T, K extends keyof T> {
  key: K;
  label: string;
  format: (value: T[K], row: T) => unknown;
}

/**
 * Encode an array of objects as a CSV
 * @param rows An array of objects. Each item in the array represents a row.
 * @param options
 * @returns
 */
export function encode<T extends {}>(
  rows: T[],
  { columns }: EncodeOptions<T> = {}
): ReadableStream {
  // Cloudflare Workers cannot construct a ReadableStream
  const { readable, writable } = new TransformStream();
  (async () => {
    const writer = writable.getWriter();
    if (rows.length > 0) {
      if (!columns) {
        columns = Object.keys(rows[0]).map(key => ({
          key: key as keyof T,
          label: key,
          format: (x: any) => x
        }));
      }
      await writeRows(writer, rows, columns);
    }
    await writer.close();
  })();

  return readable;
}

async function writeRows<T>(
  writer: WritableStreamDefaultWriter,
  rows: T[],
  columns: Column<T, keyof T>[]
) {
  const text = new TextEncoder();
  const utf8 = text.encode.bind(text);
  const write = writer.write.bind(writer);
  // write header row
  await write(utf8(columns.map(c => encodeValue(c.label)).join(delimiter)));

  for (const row of rows) {
    // write row delimiter
    await write(utf8(rowDelimiter));

    // write data row
    let s = '';
    let first = true;
    for (const { key, format } of columns) {
      s += (first ? '' : ',') + encodeValue(format(row[key], row));
      first = false;
    }
    await write(utf8(s));
  }
}

function encodeValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  if (typeof value === 'string') {
    const shouldQuote = requiresQuoteRegex.test(value);
    value = value.replace('\0', '').replace(quoteRegex, '""');
    if (shouldQuote) {
      value = quote + value + quote;
    }
    return value;
  }
  // Assume value is boolean/number/Date and does not require encoding.
  // Trading robustness for performance.
  return String(value);
}
