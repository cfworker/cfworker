import { addEventListener, dispatchEvent } from './add-event-listener.js';
import { FetchEvent } from './fetch-event.js';
import { HTMLRewriter } from './html-rewriter';
import { MemoryKVNamespace, StaticContentKVNamespace } from './kv.js';

export class ServiceWorkerGlobalScope {
  /**
   * @param {string[]} globals additional globals to expose
   * @param {Record<string, string> | null} staticContentManifest Workers site manifest.
   * @param {import('../kv.js').KVNamespaceInit[]} kvNamespaces Workers KV namespaces.
   */
  constructor(globals, staticContentManifest, kvNamespaces) {
    this.Array = Array;
    this.ArrayBuffer = ArrayBuffer;
    this.Atomics = Atomics;
    this.BigInt = BigInt;
    this.BigInt64Array = BigInt64Array;
    this.BigUint64Array = BigUint64Array;
    this.Boolean = Boolean;
    this.DataView = DataView;
    this.Date = Date;
    this.Error = Error;
    this.EvalError = EvalError;
    this.Event = Event;
    this.FetchEvent = FetchEvent;
    this.Float32Array = Float32Array;
    this.Float64Array = Float64Array;
    this.FormData = FormData;
    this.Function = Function;
    this.Headers = Headers;
    this.HTMLRewriter = HTMLRewriter;
    this.Int16Array = Int16Array;
    this.Int32Array = Int32Array;
    this.Int8Array = Int8Array;
    this.Intl = Intl;
    this.JSON = JSON;
    this.Map = Map;
    this.Math = Math;
    this.NaN = NaN;
    this.Number = Number;
    this.Object = Object;
    this.Promise = Promise;
    this.Proxy = Proxy;
    this.RangeError = RangeError;
    this.ReadableStream = ReadableStream;
    this.ReferenceError = ReferenceError;
    this.Reflect = Reflect;
    this.RegExp = RegExp;
    this.Request = Request;
    this.Response = Response;
    this.Set = Set;
    this.SharedArrayBuffer = SharedArrayBuffer;
    this.String = String;
    this.Symbol = Symbol;
    this.SyntaxError = SyntaxError;
    this.TextDecoder = TextDecoder;
    this.TextEncoder = TextEncoder;
    this.TransformStream = TransformStream;
    this.TypeError = TypeError;
    this.URIError = URIError;
    this.URL = URL;
    this.URLSearchParams = URLSearchParams;
    this.Uint16Array = Uint16Array;
    this.Uint32Array = Uint32Array;
    this.Uint8Array = Uint8Array;
    this.Uint8ClampedArray = Uint8ClampedArray;
    this.WeakMap = WeakMap;
    this.WebAssembly = WebAssembly;
    this.WritableStream = WritableStream;
    this.addEventListener = addEventListener;
    this.atob = atob.bind(self);
    this.btoa = btoa.bind(self);
    this.clearInterval = clearInterval.bind(self);
    this.clearTimeout = clearTimeout.bind(self);
    this.console = console;
    this.constructor = ServiceWorkerGlobalScope;
    this.crypto = crypto;
    this.caches = caches;
    this.decodeURI = decodeURI.bind(self);
    this.decodeURIComponent = decodeURIComponent.bind(self);
    this.dispatchEvent = dispatchEvent;
    this.encodeURI = encodeURI.bind(self);
    this.encodeURIComponent = encodeURIComponent.bind(self);
    this.escape = escape.bind(self);
    this.fetch = fetch.bind(self);
    this.globalThis = this;
    this.isFinite = isFinite.bind(self);
    this.isNaN = isNaN.bind(self);
    this.parseFloat = parseFloat.bind(self);
    this.parseInt = parseInt.bind(self);
    this.self = this;
    this.setInterval = setInterval.bind(self);
    this.setTimeout = setTimeout.bind(self);
    // @ts-ignore
    this.undefined = undefined;
    this.unescape = unescape.bind(self);
    // @ts-ignore
    this[Symbol.unscopables] = undefined;

    for (const global of globals) {
      if (self.hasOwnProperty(global)) {
        // @ts-ignore
        this[global] = self[global];
      }
    }
    if (staticContentManifest) {
      this['__STATIC_CONTENT_MANIFEST'] = JSON.stringify(staticContentManifest);
      this['__STATIC_CONTENT'] = new StaticContentKVNamespace();
    }
    for (const { name, items } of kvNamespaces) {
      // @ts-ignore
      this[name] = new MemoryKVNamespace(items);
    }
  }

  async init() {
    // @ts-ignore
    this.caches.default = await this.caches.open('default');
  }
}
