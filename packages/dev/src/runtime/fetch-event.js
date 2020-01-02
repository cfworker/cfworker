export class FetchEvent extends Event {
  /**
   * @param {Request} request
   */
  constructor(request) {
    super('fetch');
    this.request = request;
    /** @type {Promise<Response>} */
    this.__responded__ = new Promise(resolve => (this.respondWith = resolve));
  }

  passThroughOnException() {}

  waitUntil() {}
}
