import { Router } from '@cfworker/web';
import { css } from './inline-styles';

export const routes = new Router()
  .get('/', ({ res }) => {
    res.type = 'text/html';
    res.body = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>cfworker</title>
    <meta name="description" content="Packages optimized for Cloudflare Workers" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="cfworker" />
    <meta property="og:description" content="Packages optimized for Cloudflare Workers" />
    <meta property="og:image" content="" />
    <meta property="og:url" content="https://cfworker.dev" />
    <meta name="twitter:card" content="summary" />
    <meta name="color-scheme" content="dark" />
    <link rel="icon" href="logo-mark.svg" type="image/svg+xml" />
    <style>${css}</style>
  </head>
  <body>
    <main>
      <h1>cfworker</h1>
      <p>Packages optimized for Cloudflare Workers</p>
      <p>
        <a href="https://github.com/cfworker/cfworker">GitHub</a>
        <img class="align-middle" src="https://github.com/cfworker/cfworker/workflows/build/badge.svg" alt="(build passing)" />
      </p>
    </main>
  </body>
</html>`;
  })
  .get('/logo-mark.svg', ({ res }) => {
    res.type = 'image/svg+xml';
    res.body = `<svg xmlns="http://www.w3.org/2000/svg" baseProfile="full" width="200" height="200">
  <rect width="100%" height="100%" fill="#F38020"/>
  <text font-size="120" font-family="Arial, Helvetica, sans-serif" text-anchor="end" fill="#FFF" x="185" y="185">W</text>
</svg>`;
  }).middleware;
