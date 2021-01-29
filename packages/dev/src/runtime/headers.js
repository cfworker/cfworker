const forbidden = [
  // response headers
  'set-cookie',
  // request headers
  'accept-charset',
  'accept-encoding',
  'access-control-request-headers',
  'access-control-request-method',
  'connection',
  'content-length',
  'cookie',
  'cookie2',
  'date',
  'dnt',
  'expect',
  'host',
  'keep-alive',
  'origin',
  'referer',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'via'
];

/**
 * @param {string} name
 */
export function escapeHeaderName(name) {
  // use Header class's name normalization logic.
  if (typeof name !== 'string') {
    name = String(name);
  }
  name = name.toLowerCase();
  // remap name
  if (forbidden.includes(name)) {
    name = '__forbidden__' + name;
  }
  return name;
}

/**
 * @param {string} name
 */
export function unescapeHeaderName(name) {
  return name.replace(/^__forbidden__/, '');
}

/**
 * @param {typeof Headers} Headers
 */
export function wrapHeaders(Headers) {
  /** @type {('append' | 'delete' | 'get' | 'has' | 'set')[]} */
  const methods = ['append', 'delete', 'get', 'has', 'set'];
  for (const method of methods) {
    const standard = Headers.prototype[method];
    /**
     * @param {string} name
     * @param {...string} args
     */
    Headers.prototype[method] = function (name, ...args) {
      name = escapeHeaderName(name);
      // @ts-ignore
      return standard.call(this, name, ...args);
    };
  }

  const standardForEach = Headers.prototype.forEach;
  // @ts-ignore
  Headers.prototype.forEach = function (callbackfn) {
    standardForEach.call(this, (value, name, parent) => {
      name = unescapeHeaderName(name);
      callbackfn(value, name, parent);
    });
  };

  // @ts-ignore
  const standardEntries = Headers.prototype.entries;
  // @ts-ignore
  Headers.prototype.entries = function () {
    return Array.from(standardEntries.call(this)).map(([k, v]) => [
      unescapeHeaderName(k),
      v
    ]);
  };

  // @ts-ignore
  const standardKeys = Headers.prototype.keys;
  // @ts-ignore
  Headers.prototype.keys = function () {
    return Array.from(standardKeys.call(this)).map(unescapeHeaderName);
  };

  // // @ts-ignore
  // const standardIterator = Headers.prototype[Symbol.iterator];
  // // @ts-ignore
  // Headers.prototype[Symbol.iterator] = function* () {
  //   for (const [k, v] of standardIterator.call(this)) {
  //     yield [unescapeHeaderName(k), v];
  //   }
  // };
}
