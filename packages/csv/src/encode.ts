const quote = '"';
const quoteRegex = /"/g;
const delimiter = ',';
const rowDelimiter = '\r\n';
const requiresQuoteRegex = /["\r\n,]/;

export interface EncodeOptions {
  /**
   * Properties to include. Values will be used as column name.
   */
  columns?: Record<string, string>;
}

/**
 * Encode an array of objects as a CSV
 * @param rows An array of objects. Each item in the array represents a row.
 * @param options
 * @returns
 */
export function encode(
  rows: any[],
  { columns }: EncodeOptions = {}
): ReadableStream {
  // Cloudflare Workers cannot construct a ReadableStream
  const { readable, writable } = new TransformStream();
  (async () => {
    const writer = writable.getWriter();
    if (rows.length > 0) {
      if (!columns) {
        columns = Object.keys(rows[0]).reduce<Record<string, string>>(
          (p, c) => {
            p[c] = c;
            return p;
          },
          {}
        );
      }
      await writeRows(writer, rows, columns);
    }
    await writer.close();
  })();

  return readable;
}

async function writeRows(
  writer: WritableStreamDefaultWriter,
  rows: any[],
  columns: Record<string, string>
) {
  const text = new TextEncoder();
  const utf8 = text.encode.bind(text);
  const write = writer.write.bind(writer);
  const keys = Object.keys(columns);
  // write header row
  await write(utf8(keys.map(k => encodeValue(columns[k])).join(delimiter)));

  for (const row of rows) {
    // write row delimiter
    await write(utf8(rowDelimiter));

    // write data row
    let s = '';
    let first = true;
    for (const key of keys) {
      s += (first ? '' : ',') + encodeValue(row[key]);
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
