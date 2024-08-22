import { base64 } from 'rfc4648';

export class Signer {
  private readonly masterkey: Promise<CryptoKey>;
  private readonly encoder = new TextEncoder();

  constructor(masterkey: string) {
    const promiseLike = crypto.subtle.importKey(
      'raw',
      base64.parse(masterkey),
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );
    this.masterkey = Promise.resolve(promiseLike);
  }

  public async sign(request: Request, date = new Date()): Promise<void> {
    const key = await this.masterkey;
    const payload = this.getPayload(request, date);
    const hashed = await crypto.subtle.sign('HMAC', key, payload);
    const signature = base64.stringify(new Uint8Array(hashed));
    request.headers.set(
      'authorization',
      encodeURIComponent(`type=master&ver=1.0&sig=${signature}`)
    );
    request.headers.set('x-ms-date', date.toUTCString());
  }

  public getPayload(request: Request, date: Date): Uint8Array {
    const url = new URL(request.url);
    const { resourceType, resourceId } = this.pathnameToResource(url.pathname);
    const method = request.method.toLowerCase();
    const text = `${method}\n${resourceType}\n${resourceId}\n${date
      .toUTCString()
      .toLowerCase()}\n\n`;
    return this.encoder.encode(text);
  }

  public pathnameToResource(pathname: string): {
    resourceType: string;
    resourceId: string;
  } {
    const segments = pathname.split('/');
    if (segments.length % 2 === 0) {
      const resourceType = segments[segments.length - 1];
      const resourceId = segments.slice(1, segments.length - 1).join('/');
      return { resourceType, resourceId };
    }
    const resourceType = segments[segments.length - 2];
    const resourceId = segments.slice(1, segments.length).join('/');
    return { resourceType, resourceId };
  }
}

const signers: Record<string, Signer> = {};

export function getSigner(masterKey: string): Signer {
  if (!signers[masterKey]) {
    signers[masterKey] = new Signer(masterKey);
  }
  return signers[masterKey];
}
