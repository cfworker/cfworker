import FormData from 'form-data';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { logger } from './logger.js';
import { StaticSite } from './static-site.js';

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
 * @property {string} name workers.dev project name
 * @property {string} accountId Cloudflare account id
 * @property {string} accountEmail Cloudflare account email
 * @property {string} apiKey Cloudflare API key
 * @property {StaticSite | null} site Workers Site
 */

/**
 * Deploy to workers.dev.
 * @param {DeployToWorkersDevArgs} args
 */
export async function deployToWorkersDev(args) {
  const site = await getSiteBindings(args);
  const form = new FormData();
  const body_part = 'worker.js';
  const metadata = {
    body_part,
    bindings: site.bindings
  };
  form.append('metadata', JSON.stringify(metadata), {
    contentType: 'application/json'
  });
  form.append(body_part, args.code, { contentType: 'application/javascript' });

  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/workers/scripts/${args.name}`,
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

  await site.kvCleanup();
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
 * @property {StaticSite | null} site Workers Site
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

  const site = await getSiteBindings(args);

  logger.progress('Deploying script...');
  const form = new FormData();
  const body_part = args.name;
  const metadata = {
    body_part,
    bindings: site.bindings
  };
  form.append('metadata', JSON.stringify(metadata), {
    contentType: 'application/json'
  });
  form.append(body_part, args.code, { contentType: 'application/javascript' });

  response = await fetch(
    `${apiBase}/accounts/${args.accountId}/workers/scripts/${args.name}`,
    {
      method: 'PUT',
      headers: Object.assign({}, form.getHeaders(), {
        'X-Auth-Email': args.accountEmail,
        'X-Auth-Key': args.apiKey
      }),
      body: form.getBuffer()
    }
  );

  await site.kvCleanup();

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

/**
 *
 * @param {string} title
 * @param {{ accountId: string; accountEmail: string; apiKey: string; }} args
 */
async function getNamespace(title, args) {
  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/storage/kv/namespaces?per_page=100`,
    {
      headers: {
        'X-Auth-Email': args.accountEmail,
        'X-Auth-Key': args.apiKey
      }
    }
  );
  if (!response.ok) {
    throw new Error(
      `Error fetching namespaces - ${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }
  const data = await response.json();
  // @ts-ignore
  return data.result.find(x => x.title === title);
}

/**
 *
 * @param {string} id
 * @param {{ accountId: string; accountEmail: string; apiKey: string; }} args
 * @returns {Promise<{ name: string; }[]>}
 */
async function getNamespaceKeys(id, args) {
  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/storage/kv/namespaces/${id}/keys?limit=1000`,
    {
      headers: {
        'X-Auth-Email': args.accountEmail,
        'X-Auth-Key': args.apiKey
      }
    }
  );
  if (!response.ok) {
    throw new Error(
      `Error fetching namespace keys - ${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }
  const data = await response.json();
  // @ts-ignore
  return data.result;
}

/**
 *
 * @param {string} title
 * @param {{ accountId: string; accountEmail: string; apiKey: string; }} args
 */
async function createNamespace(title, args) {
  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/storage/kv/namespaces`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Email': args.accountEmail,
        'X-Auth-Key': args.apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ title })
    }
  );
  if (!response.ok) {
    throw new Error(
      `Error creating namespace - ${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }
  const data2 = await response.json();
  return data2.result;
}

/**
 * @param {{ site: StaticSite | null; name: string; accountId: string; accountEmail: string; apiKey: string; }} args
 * @returns {Promise<{ bindings: any[]; kvCleanup: () => Promise<void>; }>}
 */
async function getSiteBindings(args) {
  if (!args.site) {
    return { bindings: [], kvCleanup: async () => {} };
  }

  logger.progress('Publishing site assets to KV...');
  const title = `__${args.name}-workers_sites_assets`;
  const namespace =
    (await getNamespace(title, args)) || (await createNamespace(title, args));

  await publishSiteToKV(args, namespace);

  return {
    bindings: [
      {
        type: 'plain_text',
        name: '__STATIC_CONTENT_MANIFEST',
        text: JSON.stringify(args.site.manifest)
      },
      {
        type: 'kv_namespace',
        name: '__STATIC_CONTENT',
        namespace_id: namespace.id
      }
    ],
    kvCleanup: () => bulkDelete(args, namespace)
  };
}

/**
 * @param {{ site: StaticSite; name: string; accountId: string; accountEmail: string; apiKey: string; }} args
 * @param {{ id: string; }} namespace
 */
async function publishSiteToKV(args, namespace) {
  const body = JSON.stringify(
    await Promise.all(
      Object.entries(args.site.files).map(async ([key, filename]) => ({
        key,
        value: (await fs.readFile(filename)).toString('base64'),
        base64: true
      }))
    )
  );
  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/storage/kv/namespaces/${namespace.id}/bulk`,
    {
      method: 'PUT',
      headers: {
        'X-Auth-Email': args.accountEmail,
        'X-Auth-Key': args.apiKey,
        'content-type': 'application/json'
      },
      body
    }
  );
  if (!response.ok) {
    throw new Error(
      `Error publishing static files to KV - ${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }
}

/**
 * @param {{ site: StaticSite; name: string; accountId: string; accountEmail: string; apiKey: string; }} args
 * @param {{ id: string; }} namespace
 */
async function bulkDelete(args, namespace) {
  logger.progress('Removing stale site assets...');
  const keys = await getNamespaceKeys(namespace.id, args);
  const body = JSON.stringify(
    keys.filter(key => !args.site.files[key.name]).map(key => key.name)
  );
  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/storage/kv/namespaces/${namespace.id}/bulk`,
    {
      method: 'DELETE',
      headers: {
        'X-Auth-Email': args.accountEmail,
        'X-Auth-Key': args.apiKey,
        'content-type': 'application/json'
      },
      body
    }
  );
  if (!response.ok) {
    throw new Error(
      `Error deleting stale KV - ${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }
}
