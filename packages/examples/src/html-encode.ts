const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function htmlEncode(value: string): string {
  return value.replace(/[&<>"']/g, character => entities[character]);
}
