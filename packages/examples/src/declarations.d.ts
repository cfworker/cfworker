declare var process: {
  env: {
    AUTH0_CLIENT_ID: string;
    AUTH0_CLIENT_SECRET: string;
    AUTH0_DOMAIN: string;
    COSMOS_DB_DATABASE: string;
    COSMOS_DB_MASTER_KEY: string;
    COSMOS_DB_ORIGIN: string;
    MAILGUN_API_KEY: string;
    NODE_ENV?: string;
    SENTRY_DSN: string;
    [name: string]: string | undefined;
  };
};

interface WorkerGlobalScopeEventMap {
  fetch: FetchEvent;
}
