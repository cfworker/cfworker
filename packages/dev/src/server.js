import { EventEmitter } from 'events';
import { createServer } from 'http';
import { logger } from './logger.js';
import { requireContent } from './require-content.js';

export class Server extends EventEmitter {
  pathPrefix = '/__debug__';

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

  /**
   * @param {number} port
   */
  constructor(port) {
    super();
    this.port = port;
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

  /** @type {import('http').RequestListener} */
  requestListener = async (req, res) => {
    try {
      let url = req.url || '/';

      if (!url.startsWith(this.pathPrefix)) {
        this.emit('request', req, res);
        return;
      }

      url = url
        .replace(this.pathPrefix, '')
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
