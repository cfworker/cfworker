import {
  CookieSerializeOptions,
  parse as parseCookie,
  serialize as serializeCookie
} from 'cookie';

const noCookies = Object.create(null);

export class Cookies {
  private readonly requestCookies: Record<string, string>;

  constructor(
    requestHeaders: Headers,
    private readonly responseHeaders: Headers
  ) {
    const cookie = requestHeaders.get('cookie');
    this.requestCookies = cookie ? parseCookie(cookie) : noCookies;
  }

  public get(name: string): string | null {
    return this.requestCookies[name] || null;
  }

  public set(name: string, val: string, options?: CookieSerializeOptions) {
    this.responseHeaders.append(
      'Set-Cookie',
      serializeCookie(name, val, options)
    );
  }
}
