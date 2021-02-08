import FormData from 'form-data';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { KV } from './kv.js';
import { logger } from './logger.js';
import { StaticSite } from './static-site.js';

const apiBase = 'https://api.cloudflare.com/client/v4';

/**
 * @param {string} apiKey Cloudflare API key
 * @param {string | undefined} accountEmail Cloudflare account email
 * @returns {Object.<string, string>}
 */
function buildAuthHeaders(apiKey, accountEmail) {
  return accountEmail
    ? {
        'X-Auth-Email': accountEmail,
        'X-Auth-Key': apiKey
      }
    : {
        Authorization: 'Bearer ' + apiKey
      };
}

/**
 * @param {string} accountId Cloudflare account id
 * @param {string} apiKey Cloudflare API key
 * @param {string | undefined} accountEmail Cloudflare account email
 */
export async function getWorkersDevSubdomain(accountId, apiKey, accountEmail) {
  const response = await fetch(
    `${apiBase}/accounts/${accountId}/workers/subdomain`,
    {
      headers: buildAuthHeaders(apiKey, accountEmail)
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
 * @property {string|undefined} accountEmail Cloudflare account email
 * @property {string} apiKey Cloudflare API key
 * @property {StaticSite | null} site Workers Site
 * @property {KV} kv Workers KV
 */

/**
 * Deploy to workers.dev.
 * @param {DeployToWorkersDevArgs} args
 */
export async function deployToWorkersDev(args) {
  const site = await getSiteBindings(args);
  const kv = await getKVBindings(args);
  const form = new FormData();
  const body_part = 'worker.js';
  const metadata = {
    body_part,
    bindings: [...site.bindings, ...kv.bindings]
  };
  form.append('metadata', JSON.stringify(metadata), {
    contentType: 'application/json',
    filename: 'metadata.json'
  });
  if (site.manifest) {
    form.append('manifest', site.manifest, {
      contentType: 'text/plain',
      filename: 'manifest.json'
    });
  }
  form.append(body_part, args.code, {
    contentType: 'application/javascript',
    filename: body_part
  });

  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/workers/scripts/${args.name}`,
    {
      method: 'PUT',
      headers: Object.assign(
        {},
        form.getHeaders(),
        buildAuthHeaders(args.apiKey, args.accountEmail)
      ),
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
  await kv.kvCleanup();
}

/**
 * @typedef {object} DeployArgs
 * @property {string} name Worker script name
 * @property {string} code Worker javascript code
 * @property {string} routePattern Worker route pattern
 * @property {string} accountId Cloudflare account id
 * @property {string|undefined} accountEmail Cloudflare account email
 * @property {string} zoneId Cloudflare zone id
 * @property {string} apiKey Cloudflare API key
 * @property {boolean} purgeCache Whether to purge the cache (purges everything)
 * @property {StaticSite | null} site Workers Site
 * @property {KV} kv Workers KV
 */

/**
 *
 * @param {DeployArgs} args
 */
export async function deploy(args) {
  const authHeaders = buildAuthHeaders(args.apiKey, args.accountEmail);

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
  const kv = await getKVBindings(args);

  logger.progress('Deploying script...');
  const form = new FormData();
  const body_part = args.name;
  const metadata = {
    body_part,
    bindings: [...site.bindings, ...kv.bindings]
  };
  form.append('metadata', JSON.stringify(metadata), {
    contentType: 'application/json',
    filename: 'metadata.json'
  });
  if (site.manifest) {
    form.append('manifest', site.manifest, {
      contentType: 'text/plain',
      filename: 'manifest.json'
    });
  }
  form.append(body_part, args.code, {
    contentType: 'application/javascript',
    filename: body_part
  });

  response = await fetch(
    `${apiBase}/accounts/${args.accountId}/workers/scripts/${args.name}`,
    {
      method: 'PUT',
      headers: Object.assign(
        {},
        form.getHeaders(),
        buildAuthHeaders(args.apiKey, args.accountEmail)
      ),
      body: form.getBuffer()
    }
  );

  if (!response.ok) {
    throw new Error(
      `GET worker routes failed.\n${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }

  await site.kvCleanup();
  await kv.kvCleanup();

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
 * @param {{ accountId: string; accountEmail: string | undefined; apiKey: string; }} args
 */
async function getNamespace(title, args) {
  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/storage/kv/namespaces?per_page=100`,
    {
      headers: buildAuthHeaders(args.apiKey, args.accountEmail)
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
 * @param {{ accountId: string; accountEmail: string | undefined; apiKey: string; }} args
 * @returns {Promise<{ name: string; }[]>}
 */
async function getNamespaceKeys(id, args) {
  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/storage/kv/namespaces/${id}/keys?limit=1000`,
    {
      headers: buildAuthHeaders(args.apiKey, args.accountEmail)
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
 * @param {{ accountId: string; accountEmail: string | undefined; apiKey: string; }} args
 */
async function createNamespace(title, args) {
  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/storage/kv/namespaces`,
    {
      method: 'POST',
      headers: Object.assign(
        { 'content-type': 'application/json' },
        buildAuthHeaders(args.apiKey, args.accountEmail)
      ),
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
 * @param {{ site: StaticSite | null; name: string; accountId: string; accountEmail: string | undefined; apiKey: string; }} args
 * @returns {Promise<{ bindings: any[]; kvCleanup: () => Promise<void>; manifest?: string }>}
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
        type: 'text_blob',
        name: '__STATIC_CONTENT_MANIFEST',
        part: 'manifest'
      },
      {
        type: 'kv_namespace',
        name: '__STATIC_CONTENT',
        namespace_id: namespace.id
      }
    ],
    kvCleanup: () => bulkDelete(args, namespace),
    manifest: JSON.stringify(args.site.manifest)
  };
}

/**
 * @param {{ kv: KV; name: string; accountId: string; accountEmail: string | undefined; apiKey: string; }} args
 * @returns {Promise<{ bindings: any[]; kvCleanup: () => Promise<void>; }>}
 */
async function getKVBindings(args) {
  if (args.kv.namespaces.length === 0) {
    return { bindings: [], kvCleanup: async () => {} };
  }

  const bindings = [];

  for (const { name, items } of args.kv.namespaces) {
    logger.progress(`Publishing KV namespace "${name}"...`);
    const namespace =
      (await getNamespace(name, args)) || (await createNamespace(name, args));
    await bulkKV(args, namespace, items);
    bindings.push({
      type: 'kv_namespace',
      name,
      namespace_id: namespace.id
    });
  }

  return {
    bindings,
    kvCleanup: () => Promise.resolve() // todo
  };
}

/**
 * @param {{ site: StaticSite; name: string; accountId: string; accountEmail: string | undefined; apiKey: string; }} args
 * @param {{ id: string; }} namespace
 */
async function publishSiteToKV(args, namespace) {
  const items = await Promise.all(
    Object.entries(args.site.files).map(async ([key, filename]) => ({
      key,
      value: (await fs.readFile(filename)).toString('base64'),
      base64: true
    }))
  );
  await bulkKV(args, namespace, items);
}

/**
 * @param {{ accountId: string; accountEmail: string | undefined; apiKey: string; }} args
 * @param {{ id: string; }} namespace
 * @param {import('./kv.js').KVItem[]} items
 */
async function bulkKV(args, namespace, items) {
  const response = await fetch(
    `${apiBase}/accounts/${args.accountId}/storage/kv/namespaces/${namespace.id}/bulk`,
    {
      method: 'PUT',
      headers: Object.assign(
        { 'content-type': 'application/json' },
        buildAuthHeaders(args.apiKey, args.accountEmail)
      ),
      body: JSON.stringify(items)
    }
  );
  if (!response.ok) {
    throw new Error(
      `Error publishing items to KV - ${response.status}: ${
        response.statusText
      }\n${await response.text()}`
    );
  }
}

/**
 * @param {{ site: StaticSite; name: string; accountId: string; accountEmail: string | undefined; apiKey: string; }} args
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
      headers: Object.assign(
        { 'content-type': 'application/json' },
        buildAuthHeaders(args.apiKey, args.accountEmail)
      ),
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
