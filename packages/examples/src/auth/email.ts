import * as base64url from '@cfworker/base64url';

/**
 * Response from mailgun email validation API.
 */
export interface EmailValidationResponse {
  /**
   * Email address being validated
   */
  address: string;
  /**
   * Null if nothing, however if a potential typo is made, the closest suggestion is provided
   */
  did_you_mean: string | null;
  /**
   * If the domain is in a list of disposable email addresses, this will be appropriately categorized
   */
  is_disposable_address: boolean;
  /**
   * Checks the mailbox portion of the email if it matches a specific role type (‘admin’, ‘sales’, ‘webmaster’)
   */
  is_role_address: boolean;
  /**
   * Runs the email segments across a valid known provider rule list. If a violation occurs this value is false
   */
  is_valid: boolean;
  /**
   * If the mail_verification flag is enabled, a call is made to the ESP to return existence. (true, false, unknown or null)
   */
  mailbox_verification: boolean | null;
  /**
   * Parsed segments of the provided email address
   */
  parts: {
    display_name: string | null;
    domain: string;
    local_part: string;
  };
}

export async function validateEmail(
  email: string
): Promise<EmailValidationResponse> {
  const url = new URL('https://api.mailgun.net/v4/address/validate');
  url.searchParams.set('address', email);
  const response = await fetch(url.href, {
    headers: {
      Authorization: `Basic ${base64url.encode(
        `api:${process.env.MAILGUN_API_KEY}`
      )}`
    }
  });
  if (response.ok) {
    return response.json();
  }
  const text = await response.text();
  throw new Error(text);
}
