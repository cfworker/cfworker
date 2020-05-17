import { Context } from '@cfworker/web';
import { validateEmail } from './email';
import { TokenResponse } from './token-response';

let managementToken: string;

export async function getManagementToken(): Promise<string> {
  if (managementToken) {
    return managementToken;
  }
  const url = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;
  const body = JSON.stringify({
    grant_type: 'client_credentials',
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
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
    const tokenResponse: TokenResponse = await response.json();
    managementToken = tokenResponse.access_token;
    return managementToken;
  }
  const text = await response.text();
  throw new Error(text);
}

export async function createEmailVerificationTicket(
  args: CreateEmailVerificationTicketArgs
) {
  const token = await getManagementToken();
  const body = JSON.stringify(args);
  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/tickets/email-verification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body
    }
  );
  return response.json();
}

async function createUser(args: CreateUserArgs): Promise<CreateUserResponse> {
  const emailResult = await validateEmail(args.email);
  const token = await getManagementToken();

  const body = JSON.stringify({
    connection: 'Username-Password-Authentication',
    email: emailResult.address,
    password: args.password,
    email_verified: false,
    verify_email: true,
    user_metadata: {},
    app_metadata: { tenant: args.tenant },
    given_name: args.given_name,
    family_name: args.family_name,
    name: `${args.given_name} ${args.family_name}`
  });
  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body
    }
  );
  return response.json();
}

interface CreateEmailVerificationTicketArgs {
  result_url: string;
  user_id: string;
  ttl_sec: number;
}

interface CreateUserArgs {
  email: string;
  password: string;
  given_name: string;
  family_name: string;
  tenant: string;
}

interface CreateUserResponse {
  app_metadata: { tenant: string };
  created_at: string;
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  //identities: [{connection: "Username-Password-Authentication", user_id: "5c6114f2736a0d6987dd4c56",…}]
  name: string;
  nickname: string;
  picture: string;
  updated_at: string;
  user_id: string;
}

export async function handleRegister({ req, res }: Context) {
  const createUserArgs = await req.body.json();
  const user = await createUser(createUserArgs);
  // const evArgs = {
  //   result_url: `${req.url.origin}/email-verified`,
  //   user_id: user.user_id,
  //   ttl_sec: 60 * 60 * 24
  // };
  // const ticket = await createEmailVerificationTicket(evArgs);
  res.body = JSON.stringify({ user });
  res.headers.set('content-type', 'application/json');
}
