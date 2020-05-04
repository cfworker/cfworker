// @ts-ignore
import { preferredCharsets } from 'negotiator/lib/charset.js';
// @ts-ignore
import { preferredEncodings } from 'negotiator/lib/encoding.js';
// @ts-ignore
import { preferredLanguages } from 'negotiator/lib/language.js';
// @ts-ignore
import { preferredMediaTypes } from 'negotiator/lib/mediaType.js';

const parseAccept = preferredMediaTypes as (header: string) => string[];
const parseAcceptLanguage = preferredLanguages as (header: string) => string[];
const parseAcceptEncoding = preferredEncodings as (header: string) => string[];
const parseAcceptCharset = preferredCharsets as (header: string) => string[];

export class Accepts {
  private _type: string[] | undefined = undefined;
  private _language: string[] | undefined = undefined;
  private _encoding: string[] | undefined = undefined;
  private _charset: string[] | undefined = undefined;

  constructor(private readonly headers: Headers) {}

  public type<T extends string>(...values: T[]): T | false {
    if (!this._type) {
      const header = this.headers.get('accept');
      this._type = header ? parseAccept(header.toLowerCase()) : [];
    }
    for (const accepted of this._type) {
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
      const header = this.headers.get('accept-language');
      this._language = header ? parseAcceptLanguage(header.toLowerCase()) : [];
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
      this._encoding = header ? parseAcceptEncoding(header.toLowerCase()) : [];
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
      const header = this.headers.get('accept-charset');
      this._charset = header ? parseAcceptCharset(header.toLowerCase()) : [];
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
