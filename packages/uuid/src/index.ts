const r = new Uint8Array(16);

/**
 * Generate a V4 compliant uuid.
 */
export function uuid(separator = '-'): string {
  crypto.getRandomValues(r);
  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  r[6] = (r[6] & 0x0f) | 0x40;
  r[8] = (r[8] & 0x3f) | 0x80;
  return (
    bth[r[0]] +
    bth[r[1]] +
    bth[r[2]] +
    bth[r[3]] +
    separator +
    bth[r[4]] +
    bth[r[5]] +
    separator +
    bth[r[6]] +
    bth[r[7]] +
    separator +
    bth[r[8]] +
    bth[r[9]] +
    separator +
    bth[r[10]] +
    bth[r[11]] +
    bth[r[12]] +
    bth[r[13]] +
    bth[r[14]] +
    bth[r[15]]
  );
}

/**
 * Byte to hex mapping.
 * @type {string[]}
 */
const bth: string[] = [];

for (let i = 0; i < 256; i++) {
  bth[i] = (i + 0x100).toString(16).substr(1);
}
