import { parseCookie, stringifySetCookie, SerializeOptions } from 'cookie';

const noCookies = Object.create(null);

export class Cookies {
  private readonly requestCookies: Record<string, string | undefined>;

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

  public set(name: string, val: string, options?: SerializeOptions): void {
    const { encode, ...cookieOptions } = options ?? {};
    this.responseHeaders.append(
      'Set-Cookie',
      stringifySetCookie(
        { name, value: val, ...cookieOptions },
        encode ? { encode } : undefined
      )
    );
  }
}
