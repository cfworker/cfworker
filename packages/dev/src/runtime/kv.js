export class MemoryKVNamespace {
  /**
   * @param {Record<string, Response>} responses
   */
  constructor(responses = {}) {
    this.responses = responses;
  }

  /**
   * @param {string} key
   * @param {'text' | 'json' | 'arrayBuffer' | 'stream'} type
   */
  get(key, type = 'text') {
    let response = this.responses[key];
    if (response === undefined) {
      return Promise.resolve(null);
    }
    response = response.clone();
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
  put(key, value, options = {}) {
    this.responses[key] = new Response(value);
    if (options.expirationTtl) {
      setTimeout(() => this.delete(key), +options.expirationTtl);
    }
    if (options.expiration) {
      setTimeout(() => this.delete(key), +options.expiration - Date.now());
    }
    return Promise.resolve();
  }

  /**
   * @param {string} key
   */
  delete(key) {
    delete this.responses[key];
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
