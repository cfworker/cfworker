import { EventEmitter } from 'events';
import { createReadStream } from 'fs';
import { createServer } from 'http';
import { logger } from './logger.js';
import { requireContent } from './require-content.js';
import { StaticSite } from './static-site.js';

export class Server extends EventEmitter {
  pathPrefix = '/__debug__';
  staticContentPrefix = '/static-content/';
  reqPrefix = `/req/`;
  nextReqKey = 0;

  indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Worker Dev</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="data:;base64,iVBORw0KGgo=">
    <script type="module" src="${this.pathPrefix}/runtime/index.js"></script>
  </head>
  <body>
  </body>
</html>`;

  /** @type {Map<number, import('http').IncomingMessage>} */
  reqs = new Map();

  /**
   * @param {number} port
   * @param {StaticSite | null} staticSite
   */
  constructor(port, staticSite) {
    super();
    this.port = port;
    this.staticSite = staticSite;
    this.server = createServer(this.requestListener);
    this.serving = new Promise(resolve => this.server.on('listening', resolve));
  }

  serve() {
    this.server.listen(this.port);
    return this.serving;
  }

  dispose() {
    return new Promise(resolve => this.server.close(resolve));
  }

  /**
   * @param {import('http').IncomingMessage} req
   */
  setReq(req) {
    this.nextReqKey++;
    this.reqs.set(this.nextReqKey, req);
    return `${this.pathPrefix}${this.reqPrefix}${this.nextReqKey}`;
  }

  /** @type {import('http').RequestListener} */
  requestListener = async (req, res) => {
    try {
      let url = req.url || '/';

      if (!url.startsWith(this.pathPrefix)) {
        this.emit('request', req, res);
        return;
      }
      url = url.replace(this.pathPrefix, '');

      if (url.startsWith(this.staticContentPrefix) && this.staticSite) {
        url = url.substr(this.staticContentPrefix.length);
        const filename = this.staticSite.files[url];
        if (filename) {
          const s = createReadStream(filename);
          res.statusCode = 200;
          // @ts-ignore
          s.pipe(res);
        } else {
          res.writeHead(404, 'Not found', { 'cache-control': 'no-store' });
          res.end();
        }
        return;
      }

      if (url.startsWith(this.reqPrefix)) {
        const key = +url.substr(this.reqPrefix.length);
        const req = this.reqs.get(key);
        if (!req) {
          res.writeHead(404, 'Not found', { 'cache-control': 'no-store' });
          res.end();
          return;
        }
        this.reqs.delete(key);
        res.writeHead(200);
        req.pipe(res);
        return;
      }

      url = url
        .replace('/runtime/', './runtime/')
        .replace('/node_modules/', '');

      if (url === '/') {
        res.writeHead(200, 'OK', {
          'content-type': 'text/html',
          'cache-control': 'no-store'
        });
        res.write(this.indexHtml);
        res.end();
        return;
      }

      const { content, type } = requireContent(url, import.meta.url);
      res.writeHead(200, 'OK', {
        'content-type': type,
        'cache-control': 'no-store'
      });
      res.write(content);
      res.end();
    } catch (err) {
      logger.error(err);
      res.writeHead(500, 'Internal Server Error', {
        'content-type': 'text/plain'
      });
      res.write(err.toString());
      res.end();
    }
  };
}
