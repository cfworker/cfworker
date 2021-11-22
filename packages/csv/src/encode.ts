const quote = '"';
const quoteRegex = /"/g;
const delimiter = ',';
const rowDelimiter = '\r\n';
const requiresQuoteRegex = /["\r\n,]/;

export function encode(rows: any[]): ReadableStream {
  // Cloudflare Workers cannot construct a ReadableStream
  const { readable, writable } = new TransformStream();

  (async () => {
    const writer = writable.getWriter();
    await writeRows(writer, rows);
    await writer.close();
  })();

  return readable;
}

async function writeRows(writer: WritableStreamDefaultWriter, rows: any[]) {
  const text = new TextEncoder();
  const utf8 = text.encode.bind(text);
  const write = writer.write.bind(writer);
  let keys: string[] | undefined = undefined;

  for (const row of rows) {
    // write header row
    if (keys === undefined) {
      keys = Object.keys(row);
      await write(utf8(keys.map(encodeValue).join(delimiter)));
    }

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
