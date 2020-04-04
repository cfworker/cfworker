import { pad } from './pad';

/**
 * Base64 URL decode a string.
 */
export function decode(s: string): string {
  const base64 = pad(s).replace(/_/g, '/').replace(/-/g, '+');
  return decodeUnicode(atob(base64));
}

function decodeUnicode(s: string): string {
  try {
    return decodeURIComponent(
      s.replace(/(.)/g, (_, p) => {
        const code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
          return '%0' + code;
        }
        return '%' + code;
      })
    );
  } catch {
    return s;
  }
}
