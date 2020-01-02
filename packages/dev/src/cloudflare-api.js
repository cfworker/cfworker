import FormData from 'form-data';
import fetch from 'node-fetch';
import { logger } from './logger.js';

const apiBase = 'https://api.cloudflare.com/client/v4';

/**
 * @param {string} accountId Cloudflare account id
 * @param {string} accountEmail Cloudflare account email
 * @param {string} apiKey Cloudflare API key
 */
export async function getWorkersDevSubdomain(accountId, accountEmail, apiKey) {
  const response = await fetch(
    `${apiBase}/accounts/${accountId}/workers/subdomain`,
    {
      headers: {
        'X-Auth-Email': accountEmail,
        'X-Auth-Key': apiKey
      }
    }
  );
  if (!response.ok) {
    throw new Error(
      `GET worker subdomain failed.\n${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }
  /** @type {{ result: { subdomain: string; }; }} */
  const data = await response.json();
  return data.result.subdomain;
}

/**
 * @typedef {object} DeployToWorkersDevArgs
 * @property {string} code Worker javascript code
 * @property {string} project workers.dev project name
 * @property {string} accountId Cloudflare account id
 * @property {string} accountEmail Cloudflare account email
 * @property {string} apiKey Cloudflare API key
 */

/**
 * Deploy to workers.dev.
 * @param {DeployToWorkersDevArgs} args
 */
export async function deployToWorkersDev(args) {
  const form = new FormData();
  const body_part = 'worker.js';
  const metadata = {
    body_part,
    bindings: []
  };
  form.append('metadata', JSON.stringify(metadata), {
    contentType: 'application/json'
  });
  form.append(body_part, args.code, { contentType: 'application/javascript' });

  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/workers/scripts/${args.project}`,
    {
      method: 'PUT',
      headers: Object.assign({}, form.getHeaders(), {
        'X-Auth-Email': args.accountEmail,
        'X-Auth-Key': args.apiKey
      }),
      body: form.getBuffer()
    }
  );
  if (!response.ok) {
    throw new Error(
      `PUT worker script failed.\n${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }
}

/**
 * @typedef {object} DeployArgs
 * @property {string} name Worker script name
 * @property {string} code Worker javascript code
 * @property {string} routePattern Worker route pattern
 * @property {string} accountId Cloudflare account id
 * @property {string} accountEmail Cloudflare account email
 * @property {string} zoneId Cloudflare zone id
 * @property {string} apiKey Cloudflare API key
 * @property {boolean} purgeCache Whether to purge the cache (purges everything)
 */

/**
 *
 * @param {DeployArgs} args
 */
export async function deploy(args) {
  const authHeaders = {
    'X-Auth-Email': args.accountEmail,
    'X-Auth-Key': args.apiKey
  };

  logger.progress('Getting zone...');
  let response = await fetch(`${apiBase}/zones/${args.zoneId}`, {
    method: 'GET',
    headers: authHeaders
  });
  if (!response.ok) {
    throw new Error(
      `GET zone failed.\n${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }
  /** @type {string} */
  const zoneName = (await response.json()).result.name;

  logger.progress('Deploying script...');
  response = await fetch(
    `${apiBase}/accounts/${args.accountId}/workers/scripts/${args.name}`,
    {
      method: 'PUT',
      body: args.code,
      headers: Object.assign(
        { 'Content-Type': 'application/javascript' },
        authHeaders
      )
    }
  );
  if (!response.ok) {
    throw new Error(
      `PUT worker script failed.\n${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }

  if (args.routePattern) {
    logger.progress('Getting routes...');
    response = await fetch(`${apiBase}/zones/${args.zoneId}/workers/routes`, {
      headers: authHeaders
    });
    if (!response.ok) {
      throw new Error(
        `GET worker routes failed.\n${response.status}: ${
          response.statusText
        }\n${await response.text()}`
      );
    }

    /** @type {{ result: { id: string; script: string; pattern: string; }[]; }} */
    const { result: routes } = await response.json();
    const route = routes.find(r => r.script === args.name);

    if (!route) {
      logger.progress('Adding route...');
      response = await fetch(`${apiBase}/zones/${args.zoneId}/workers/routes`, {
        method: 'POST',
        body: JSON.stringify({ pattern: args.routePattern, script: args.name }),
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          authHeaders
        )
      });
      if (!response.ok) {
        throw new Error(
          `POST worker route failed.\n${response.status}: ${
            response.statusText
          }\n${await response.text()}`
        );
      }
    } else if (route.pattern !== args.routePattern) {
      logger.progress('Updating route pattern...');
      response = await fetch(
        `${apiBase}/zones/${args.zoneId}/workers/routes/${route.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ pattern: args.routePattern }),
          headers: Object.assign(
            { 'Content-Type': 'application/json' },
            authHeaders
          )
        }
      );
      if (!response.ok) {
        throw new Error(
          `PUT worker route failed.\n${response.status}: ${
            response.statusText
          }\n${await response.text()}`
        );
      }
    }
  }

  if (args.purgeCache) {
    logger.progress('Purging cache...');
    response = await fetch(`${apiBase}/zones/${args.zoneId}/purge_cache`, {
      method: 'POST',
      body: JSON.stringify({ purge_everything: true }),
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        authHeaders
      )
    });
    if (!response.ok) {
      throw new Error(
        `Purge cache failed.\n${response.status}: ${
          response.statusText
        }\n${await response.text()}`
      );
    }
  }

  return zoneName;
}
