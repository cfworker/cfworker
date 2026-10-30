const supportsRandomUUID = typeof crypto.randomUUID === 'function';

const randomArr = new Uint8Array(16);

const reg =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

const separator = '-';

/**
 * Generate a V4 compliant uuid.
 */
export function uuid(arr?: Uint8Array): string {
  if (!arr) {
    if (supportsRandomUUID) {
      return crypto.randomUUID();
    }
    crypto.getRandomValues(randomArr);
    arr = randomArr;
  }
  if (arr.length < 16) {
    throw new TypeError('UUID byte array must contain at least 16 bytes');
  }
  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  arr[6] = (arr[6]! & 0x0f) | 0x40;
  arr[8] = (arr[8]! & 0x3f) | 0x80;
  const s = (
    byteToHex(arr[0]) +
    byteToHex(arr[1]) +
    byteToHex(arr[2]) +
    byteToHex(arr[3]) +
    separator +
    byteToHex(arr[4]) +
    byteToHex(arr[5]) +
    separator +
    byteToHex(arr[6]) +
    byteToHex(arr[7]) +
    separator +
    byteToHex(arr[8]) +
    byteToHex(arr[9]) +
    separator +
    byteToHex(arr[10]) +
    byteToHex(arr[11]) +
    byteToHex(arr[12]) +
    byteToHex(arr[13]) +
    byteToHex(arr[14]) +
    byteToHex(arr[15])
  ).toLowerCase(); // https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4 https://github.com/uuidjs/uuid/pull/434
  if (!reg.test(s)) {
    throw new TypeError('Invalid uuid');
  }
  return s;
}

export function parseUuid(s: string): Uint8Array {
  if (!reg.test(s)) {
    throw new TypeError('Invalid uuid');
  }
  let v;
  const arr = new Uint8Array(16);

  // Parse ########-....-....-....-............
  arr[0] = (v = parseInt(s.slice(0, 8), 16)) >>> 24;
  arr[1] = (v >>> 16) & 0xff;
  arr[2] = (v >>> 8) & 0xff;
  arr[3] = v & 0xff;

  // Parse ........-####-....-....-............
  arr[4] = (v = parseInt(s.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff;

  // Parse ........-....-####-....-............
  arr[6] = (v = parseInt(s.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff;

  // Parse ........-....-....-####-............
  arr[8] = (v = parseInt(s.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff;

  // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)
  arr[10] = ((v = parseInt(s.slice(24, 36), 16)) / 0x10000000000) & 0xff;
  arr[11] = (v / 0x100000000) & 0xff;
  arr[12] = (v >>> 24) & 0xff;
  arr[13] = (v >>> 16) & 0xff;
  arr[14] = (v >>> 8) & 0xff;
  arr[15] = v & 0xff;

  return arr;
}

/**
 * Byte to hex mapping.
 * @type {string[]}
 */
const bth: string[] = [];

for (let i = 0; i < 256; i++) {
  bth[i] = (i + 0x100).toString(16).substr(1);
}

function byteToHex(byte: number | undefined): string {
  const hex = byte === undefined ? undefined : bth[byte];
  if (hex === undefined) {
    throw new TypeError('Invalid UUID byte');
  }
  return hex;
}
