const readSessionNotAvailableSubstatus = '1002';

export function readSessionNotAvailable(response: Response): boolean {
  return (
    response.status === 404 &&
    response.headers.get('x-ms-substatus') === readSessionNotAvailableSubstatus
  );
}

/**
 * Get the database and collection id from the x-ms-alt-content-path header or url.
 * @param requestOrResponse
 */
export function getCollectionId({
  url,
  headers
}: {
  url: string;
  headers: Headers;
}): { dbId: string; collId: string } | null {
  const path =
    headers.get('x-ms-alt-content-path') ?? new URL(url).pathname.substr(1);
  const [, dbId, colls, collId] = path.split('/');
  if (colls !== 'colls' || !collId) {
    return null;
  }
  return { dbId, collId };
}

export interface SessionTokens {
  [dbId: string]: { [collId: string]: string };
}

export interface SessionContainer {
  tokens: SessionTokens;
  setRequestSession(request: Request): void;
  readResponseSession(response: Response): void;
}

export class DefaultSessionContainer implements SessionContainer {
  constructor(public readonly tokens: SessionTokens = {}) {}

  setRequestSession(request: Request) {
    if (request.headers.get('x-ms-consistency-level') !== 'Session') {
      return;
    }
    const ids = getCollectionId(request);
    if (!ids) {
      return;
    }
    const token = this.tokens?.[ids.dbId]?.[ids.collId];
    if (token) {
      request.headers.set('x-ms-session-token', token);
    }
  }

  readResponseSession(response: Response) {
    const ids = getCollectionId(response);
    if (!ids) {
      return;
    }
    if (readSessionNotAvailable(response)) {
      if (this.tokens[ids.dbId]) {
        delete this.tokens[ids.dbId][ids.collId];
      }
    }
    const token = response.headers.get('x-ms-session-token');
    if (!token) {
      return;
    }
    this.tokens[ids.dbId] ??= {};
    this.tokens[ids.dbId][ids.collId] = token;
  }
}
