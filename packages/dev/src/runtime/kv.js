/**
 * @typedef {import("../kv").KVItem} KVItem
 */

/**
 * @param {string} base64
 */
function base64ToArrayBuffer(base64) {
  const bs = atob(base64);
  const len = bs.length;
  const bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = bs.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * @param {ArrayBuffer} buffer
 */
function arrayBufferToBase64(buffer) {
  let bs = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    bs += String.fromCharCode(bytes[i]);
  }
  return btoa(bs);
}

export class MemoryKVNamespace {
  /**
   * @param {KVItem[]} items
   */
  constructor(items) {
    /** @type {Record<string, KVItem>} */
    this.map = {};
    items.reduce((a, b) => {
      a[b.key] = b;
      return a;
    }, this.map);
  }

  /**
   * @param {string} key
   * @param {'text' | 'json' | 'arrayBuffer' | 'stream'} type
   */
  get(key, type = 'text') {
    let item = this.map[key];
    if (item === undefined) {
      return Promise.resolve(null);
    }
    const response = new Response(
      item.base64 ? base64ToArrayBuffer(item.value) : item.value
    );
    switch (type) {
      case 'text':
        return response.text();
      case 'json':
        return response.json();
      case 'arrayBuffer':
        return response.arrayBuffer();
      case 'stream':
        return Promise.resolve(response.body);
      default:
        throw new Error(`Unexpected type "${type}`);
    }
  }

  /**
   * @param {string} key
   * @param {string | ReadableStream | ArrayBuffer | FormData} value
   * @param {{ expiration?: string | number;  expirationTtl?: string | number;}} [options]
   */
  async put(key, value, options = {}) {
    this.map[key] = {
      key,
      value: arrayBufferToBase64(await new Response(value).arrayBuffer()),
      base64: true
    };
    if (options.expirationTtl) {
      setTimeout(() => this.delete(key), +options.expirationTtl);
    }
    if (options.expiration) {
      setTimeout(() => this.delete(key), +options.expiration - Date.now());
    }
  }

  /**
   * @param {string} key
   */
  delete(key) {
    delete this.map[key];
    return Promise.resolve();
  }

  list() {
    throw new Error(`${this.constructor.name} does not implement "list"`);
  }
}

export class StaticContentKVNamespace {
  /**
   * @param {string} key
   * @param {'text' | 'json' | 'arrayBuffer' | 'stream'} type
   */
  async get(key, type = 'text') {
    const response = await fetch(
      `${location.origin}/__debug__/static-content/${key}`
    );
    if (response.status === 404) {
      return null;
    }
    if (response.status !== 200) {
      throw new Error(
        `Error fetching ${key} - ${response.status}: ${response.statusText}`
      );
    }
    switch (type) {
      case 'text':
        return response.text();
      case 'json':
        return response.json();
      case 'arrayBuffer':
        return response.arrayBuffer();
      case 'stream':
        return Promise.resolve(response.body);
      default:
        throw new Error(`Unexpected type "${type}`);
    }
  }

  put() {
    throw new Error(`${this.constructor.name} does not implement "put"`);
  }

  delete() {
    throw new Error(`${this.constructor.name} does not implement "delete"`);
  }

  list() {
    throw new Error(`${this.constructor.name} does not implement "list"`);
  }
}
