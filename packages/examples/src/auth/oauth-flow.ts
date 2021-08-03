import { parseJwt } from '@cfworker/jwt';
import { Context, Cookies, HttpError, Middleware } from '@cfworker/web';
import { TokenResponse } from './token-response.js';

export function getAuthorizeUrl({ origin, href }: URL) {
  const domain = process.env.AUTH0_DOMAIN;
  const args = {
    response_type: 'code',
    client_id: process.env.AUTH0_CLIENT_ID,
    scope: 'openid profile',
    redirect_uri: `${origin}/api/auth/callback?${new URLSearchParams({
      redirect_uri: href
    })}`
  };
  return `https://${domain}/authorize?${new URLSearchParams(args)}`;
}

async function exchangeCode(
  code: string,
  redirect_uri: string
): Promise<TokenResponse> {
  const url = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;
  const body = JSON.stringify({
    grant_type: 'authorization_code',
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    code,
    redirect_uri
  });
  const init = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, no-cache'
    },
    body
  };
  const response = await fetch(url, init);
  if (response.ok) {
    return response.json();
  }
  const text = await response.text();
  throw new Error(text);
}

export function setTokenCookie(
  cookies: Cookies,
  tokenResponse: TokenResponse | null
) {
  const production = String(process.env.NODE_ENV) === 'production';

  const token = tokenResponse ? tokenResponse.id_token : 'deleted';

  const secure = production;

  const sameSite = 'strict';

  const expires = tokenResponse
    ? new Date(new Date().getTime() + tokenResponse.expires_in * 1000)
    : new Date('Thu, 01 Jan 1970 00:00:00 GMT');

  cookies.set('token', token, {
    path: '/',
    httpOnly: true,
    secure,
    sameSite,
    expires
  });
}

export async function handleTokenCallback(context: Context) {
  const code = context.req.url.searchParams.get('code');
  const redirect_uri = context.req.url.searchParams.get('redirect_uri');
  if (!code) {
    throw new HttpError(400, 'code is expected.');
  }
  if (!redirect_uri) {
    throw new HttpError(400, 'redirect_uri is expected.');
  }

  let tokenResponse: TokenResponse;
  try {
    tokenResponse = await exchangeCode(code, redirect_uri);
  } catch (err) {
    throw new HttpError(400, err.message);
  }

  setTokenCookie(context.cookies, tokenResponse);

  // https://brockallen.com/2019/01/11/same-site-cookies-asp-net-core-and-external-authentication-providers/
  context.res.status = 200;
  context.res.headers.set('content-type', 'text/html');
  context.res.body = `<!doctype html><html><head><meta http-equiv="Refresh" content="0; URL=${redirect_uri}"></head></html>`;
}

export const auth0Origin = new URL('https://' + process.env.AUTH0_DOMAIN)
  .origin;

export const authentication: Middleware = async ({ cookies, state }, next) => {
  const token = cookies.get('token');

  if (!token) {
    await next();
    return;
  }

  const result = await parseJwt(
    token,
    auth0Origin,
    process.env.AUTH0_CLIENT_ID
  );
  if (!result.valid) {
    cookies.set('reason', result.reason);
    await next();
    return;
  }
  const payload = result.payload as any;
  const { given_name, family_name, name, nickname, picture } = payload;
  state.user = {
    tenant: payload['https://auth.cfworker.dev/tenant'],
    given_name,
    family_name,
    name,
    nickname,
    picture
  };

  await next();
};

export function handleSignout({ cookies, req, res }: Context) {
  const returnTo = new URL('/signed-out', req.url.origin);
  const signOutUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
  signOutUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID);
  signOutUrl.searchParams.set('returnTo', returnTo.href);
  setTokenCookie(cookies, null);
  res.redirect(signOutUrl);
}
