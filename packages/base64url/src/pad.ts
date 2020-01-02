/**
 * Pads a base64 encoded string with equal signs.
 */
export function pad(s: string): string {
  switch (s.length % 4) {
    case 0:
      return s;
    case 2:
      return s + '==';
    case 3:
      return s + '=';
    default:
      throw 'Illegal base64url string!';
  }
}
