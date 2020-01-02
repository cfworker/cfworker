const reUnescapedHtml = /[&<>"'`]/g;
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
};

export function htmlEncode(value: string) {
  return reHasUnescapedHtml.test(value)
    ? value.replace(reUnescapedHtml, char => htmlEscapes[char])
    : value;
}
