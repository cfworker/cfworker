import { expect } from 'chai';
import { Router, RouterOptions } from '../src/router.js';

function createContext(method: string, path: string) {
  return {
    req: {
      method,
      url: new URL(`http://localhost${path}`),
      params: {}
    }
  } as any;
}

function resolve(
  pattern: string,
  path: string,
  options?: RouterOptions
): { matched: boolean; params: Record<string, string> } {
  const router = new Router(options);
  router.get(pattern, async () => {});
  const context = createContext('GET', path);

  return {
    matched: router.resolve(context) !== undefined,
    params: context.req.params
  };
}

function expectMatch(
  pattern: string,
  path: string,
  params: Record<string, string> = {},
  options?: RouterOptions
) {
  const result = resolve(pattern, path, options);
  expect(result.matched, `${pattern} should match ${path}`).to.equal(true);
  expect(result.params).to.deep.equal(params);
}

function expectNoMatch(pattern: string, path: string, options?: RouterOptions) {
  const result = resolve(pattern, path, options);
  expect(result.matched, `${pattern} should not match ${path}`).to.equal(false);
  expect(result.params).to.deep.equal({});
}

describe('Router pattern compatibility', () => {
  it('matches representative named parameter routes', () => {
    const pattern = '/groups/:group_id/items/:item_id/details';

    expectMatch(pattern, '/groups/group-1/items/item-2/details', {
      group_id: 'group-1',
      item_id: 'item-2'
    });
    expectNoMatch(pattern, '/groups/group-1/items/details');
  });

  it('matches login constraints used in nested routes', () => {
    const login = '[a-zA-Z\\d](?:[a-zA-Z\\d]|-(?=[a-zA-Z\\d])){0,29}';
    const pattern = `/:account(${login})/workspaces/:workspace(${login})/groups/:group(${login})/:tabid(summary|settings|participants|details)`;

    expectMatch(
      pattern,
      '/example-account/workspaces/sample-space/groups/branch-1/summary',
      {
        account: 'example-account',
        workspace: 'sample-space',
        group: 'branch-1',
        tabid: 'summary'
      }
    );
    expectNoMatch(
      pattern,
      '/example--account/workspaces/sample-space/groups/branch-1/summary'
    );
    expectNoMatch(
      pattern,
      '/example-account/workspaces/sample-space/groups/branch-1/unknown'
    );
  });

  it('matches constrained parameters and parameters embedded in text', () => {
    const postPattern = '/posts/:yyyymmdd(20\\d\\d-\\d\\d-\\d\\d)/:slug';
    expectMatch(postPattern, '/posts/2026-11-03/router-migration', {
      yyyymmdd: '2026-11-03',
      slug: 'router-migration'
    });
    expectNoMatch(postPattern, '/posts/26-11-03/router-migration');

    const autocompletePattern =
      '/api/accounts/:account_id/catalog/autocomplete/:product_id/:mode(labels|variants|formats)';
    expectMatch(
      autocompletePattern,
      '/api/accounts/123/catalog/autocomplete/456/variants',
      {
        account_id: '123',
        product_id: '456',
        mode: 'variants'
      }
    );
    expectNoMatch(
      autocompletePattern,
      '/api/accounts/123/catalog/autocomplete/456/unknown'
    );

    expectMatch(
      '/assets/sign-in-:part(icon|background).svg',
      '/assets/sign-in-background.svg',
      { part: 'background' }
    );
    expectMatch(
      '/assets/mark-:size(64|128|256|512|1024).png',
      '/assets/mark-512.png',
      { size: '512' }
    );
  });

  it('matches file UUID and extension constraints', () => {
    const uuid = '[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}';
    const pattern = `/files/:category(primary|templates|imports|exports|archives)/:container_id(${uuid})/:filename(${uuid}\\.(?:pdf|png))`;
    const containerId = '00000000-0000-0000-0000-000000000001';
    const fileId = '00000000-0000-0000-0000-000000000002';

    expectMatch(pattern, `/files/templates/${containerId}/${fileId}.pdf`, {
      category: 'templates',
      container_id: containerId,
      filename: `${fileId}.pdf`
    });
    expectNoMatch(pattern, `/files/unknown/${containerId}/${fileId}.pdf`);
    expectNoMatch(pattern, `/files/primary/${containerId}/${fileId}.txt`);
  });

  it('preserves legacy and repeated wildcard behavior', () => {
    expectNoMatch('/console/*', '/console');
    expectMatch('/console/*', '/console/');
    expectMatch('/console/*', '/console/entries/123', {
      '0': 'entries/123'
    });

    expectMatch('/pages*', '/pages');
    expectMatch('/pages*', '/pages/weekly', { '0': '/weekly' });
    expectMatch('/pages*', '/pages-archive', { '0': '-archive' });

    expectMatch('/content{/:file}*', '/content');
    expectMatch('/content{/:file}*', '/content/');
    expectMatch('/content{/:file}*', '/content/getting-started', {
      file: 'getting-started'
    });
    expectMatch('/content{/:file}*', '/content/guides/example', {
      file: 'guides/example'
    });

    expectNoMatch('/content{/:file}+', '/content');
    expectNoMatch('/content{/:file}+', '/content/');
    expectMatch('/content{/:file}+', '/content/guides/example', {
      file: 'guides/example'
    });

    const categoryContent = '/content/categories/:category{/:file}*';
    expectMatch(categoryContent, '/content/categories/sample-feature/', {
      category: 'sample-feature'
    });
    expectMatch(categoryContent, '/content/categories/sample-feature/setup', {
      category: 'sample-feature',
      file: 'setup'
    });
  });

  it('preserves case, trailing slash, and parameter decoding behavior', () => {
    expectMatch('/status', '/status/');
    expectNoMatch('/status', '/status/', {
      urlPatternOptions: { strict: true }
    });
    expectMatch(
      '/status',
      '/status',
      {},
      {
        urlPatternOptions: { strict: true }
      }
    );
    expectMatch('/Profiles/:handle', '/profiles/Alice', { handle: 'Alice' });
    expectNoMatch('/Profiles/:handle', '/profiles/Alice', {
      urlPatternOptions: { ignoreCase: false }
    });
    expectMatch('/files/:filename', '/files/hello%20world.pdf', {
      filename: 'hello world.pdf'
    });
  });

  it('falls through constrained routes to catch-all content routes', async () => {
    const router = new Router();
    let matched: 'post' | 'content' | undefined;

    router
      .get('/posts/:yyyymmdd(20\\d\\d-\\d\\d-\\d\\d)/:slug', async () => {
        matched = 'post';
      })
      .get('/posts{/:file}*', async () => {
        matched = 'content';
      });

    await router.middleware(
      createContext('GET', '/posts/2026-11-03/router-migration'),
      async () => {}
    );
    expect(matched).to.equal('post');

    matched = undefined;
    const context = createContext('GET', '/posts/assets/mark.png');
    await router.middleware(context, async () => {});
    expect(matched).to.equal('content');
    expect(context.req.params).to.deep.equal({ file: 'assets/mark.png' });
  });
});
