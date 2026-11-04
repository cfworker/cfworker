export function encodePointer(p: string): string {
  // encodeURI leaves "#" unchanged, but RFC 3986 does not allow it within a
  // fragment and RFC 6901 requires JSON Pointer data outside that grammar to
  // be percent-encoded.
  return encodeURI(escapePointer(p)).replace(/#/g, '%23');
}

export function escapePointer(p: string): string {
  return p.replace(/~/g, '~0').replace(/\//g, '~1');
}
