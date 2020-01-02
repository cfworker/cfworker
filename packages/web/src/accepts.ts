/**
 * Parse an Accept, Accept-Language, Accept-Charset, or Accept-Encoding header.
 * https://tools.ietf.org/html/rfc7231#section-5.3.2
 * @param value The header value
 * @returns An array of accepted MIME types, languages, charsets, or encodings,
 * sorted by priority (quality value).
 */
export function parseAccept(value: string) {
  value = value.toLowerCase();
  const r = /([^,;\s]+)(?:;q=([\d\.]+))?/g;
  let match: RegExpExecArray | null;
  const items = [] as { type: string; q: number; index: number }[];
  let index = 0;
  while ((match = r.exec(value))) {
    const type = match[1];
    const rawQ = match[2];
    const hasQ = !!rawQ;
    // parse the q value, defaulting to 1 and capping at 1.
    let q = hasQ ? Math.min(Math.max(parseFloat(rawQ), 0), 1) : 1;
    // Values with asterisks are automatically lower q than values without.
    if (hasQ && type.startsWith('*')) {
      q -= 0.0001;
    }
    if (hasQ && type.endsWith('*')) {
      q -= 0.0001;
    }
    items.push({ type, q, index });
    index++;
  }
  // Sort by q, then by header position.
  items.sort((a, b) => b.q - a.q || a.index - b.index);
  // Return only the types.
  return items.map(x => x.type);
}

export class Accepts {
  private _media: string[] | undefined = undefined;
  private _language: string[] | undefined = undefined;
  private _encoding: string[] | undefined = undefined;
  private _charset: string[] | undefined = undefined;

  constructor(private readonly headers: Headers) {}

  public media<T extends string>(...values: T[]): T | false {
    if (!this._media) {
      const header = this.headers.get('accept');
      this._media = header ? parseAccept(header) : [];
    }
    for (const accepted of this._media) {
      for (const value of values) {
        if (
          value === accepted ||
          (accepted.startsWith('*') && value.endsWith(accepted.substr(1))) ||
          (accepted.endsWith('*') &&
            value.startsWith(accepted.substr(0, accepted.length - 2)))
        ) {
          return value;
        }
      }
    }
    return false;
  }

  public language<T extends string>(...values: T[]): T | false {
    if (!this._language) {
      const header = this.headers.get('accept');
      this._language = header ? parseAccept(header) : [];
    }
    for (const accepted of this._language) {
      for (const value of values) {
        if (value === accepted || value.startsWith(accepted)) {
          return value;
        }
      }
    }
    return false;
  }

  public encoding<T extends string>(...values: T[]): T | false {
    if (!this._encoding) {
      const header = this.headers.get('accept-encoding');
      this._encoding = header ? parseAccept(header) : [];
    }
    for (const accepted of this._encoding) {
      for (const value of values) {
        if (value === accepted) {
          return value;
        }
      }
    }
    return false;
  }

  public charset<T extends string>(...values: T[]): T | false {
    if (!this._charset) {
      const header = this.headers.get('accept-encoding');
      this._charset = header ? parseAccept(header) : [];
    }
    for (const accepted of this._charset) {
      for (const value of values) {
        if (value === accepted) {
          return value;
        }
      }
    }
    return false;
  }
}
